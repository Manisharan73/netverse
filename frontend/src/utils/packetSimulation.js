import useEventStore from '../stores/event.store'
import useSwitchStore from '../stores/switch.store'
import usePacketStore from '../stores/packet.store'
import useStpStore from '../stores/stp.store'

export async function simulateHopByHop({ packet, nodes, edges, routingTables, setActiveEdges, setEdgeStatus }) {
    let latency = 0
    let ttl = packet.ttl
    let currentNodeId = packet.currentLocation

    let maxHops = 30
    let hopCount = 0

    while (hopCount < maxHops && ttl > 0) {
        hopCount++
        ttl--
        
        usePacketStore.getState().updatePacket(packet.id, (current) => ({
            ...current,
            ttl,
            currentLocation: currentNodeId
        }))

        const currentNode = nodes.find(n => n.id.toString() === currentNodeId.toString())
        if (!currentNode) {
            dropPacket(packet.id, 'Node offline')
            return { success: false }
        }

        if (currentNode.data.ip === packet.destinationIp || packet.targetId === currentNodeId.toString()) {
            setEdgeStatus('success')
            setTimeout(() => {
                usePacketStore.getState().removePacket(packet.id)
            }, 1000)
            return { success: true, latency }
        }

        let nextNodeId = null
        let nextEdgeId = null

        if (currentNode.type === 'switchNode') {
            const blockedEdges = useStpStore.getState().blockedEdges
            const macTable = useSwitchStore.getState().macTable[currentNodeId] || {}
            
            let targetEdgeId = null
            for (const [mac, entry] of Object.entries(macTable)) {
                if (mac === packet.destinationMac) {
                    targetEdgeId = entry.port
                    break
                }
            }

            if (packet.destinationMac === 'ff:ff:ff:ff:ff:ff') {
                targetEdgeId = null // Force flood for broadcast
            }

            if (targetEdgeId && !blockedEdges.includes(targetEdgeId)) {
                nextEdgeId = targetEdgeId
                const edge = edges.find(e => e.id === nextEdgeId)
                if (edge) {
                    nextNodeId = edge.source.toString() === currentNodeId.toString() ? edge.target : edge.source
                }
            } else {
                const connectedEdges = edges.filter(e => 
                    (e.source.toString() === currentNodeId.toString() || e.target.toString() === currentNodeId.toString()) &&
                    !blockedEdges.includes(e.id) &&
                    e.id !== packet.incomingEdgeId
                )

                if (connectedEdges.length === 0) {
                    dropPacket(packet.id, 'No valid ports to forward')
                    return { success: false }
                }

                if (connectedEdges.length === 1) {
                    nextEdgeId = connectedEdges[0].id
                    nextNodeId = connectedEdges[0].source.toString() === currentNodeId.toString() ? connectedEdges[0].target : connectedEdges[0].source
                } else {
                    connectedEdges.forEach((edge, index) => {
                        const targetId = edge.source.toString() === currentNodeId.toString() ? edge.target : edge.source
                        if (index === 0) {
                            nextEdgeId = edge.id
                            nextNodeId = targetId
                        } else {
                            const duplicatePacket = { 
                                ...packet, 
                                id: crypto.randomUUID(), 
                                incomingEdgeId: edge.id, 
                                currentLocation: currentNodeId 
                            }
                            usePacketStore.getState().addPacket(duplicatePacket)
                            
                            // Let the duplicate travel asynchronously
                            simulateHopByHopBranch(duplicatePacket, targetId, edge.id, nodes, edges, routingTables, setActiveEdges, setEdgeStatus)
                        }
                    })
                }
            }
        } else if (currentNode.type === 'routerNode') {
            const table = routingTables[currentNodeId] || []
            const targetSubnet = packet.destinationIp.split('.').slice(0, 3).join('.') + '.0/24'
            
            let route = table.find(r => r.destination === targetSubnet) || table.find(r => r.destination === '0.0.0.0/0')

            if (!route) {
                dropPacket(packet.id, `No route to host ${packet.destinationIp} from router ${currentNode.data.label}`)
                return { success: false }
            }

            nextEdgeId = route.interface
            nextNodeId = route.nextHopId
            
            if (!nextEdgeId || !nextNodeId) {
                const connectedEdge = edges.find(e => 
                    (e.source.toString() === currentNodeId.toString() || e.target.toString() === currentNodeId.toString())
                )
                if (connectedEdge) {
                    nextEdgeId = connectedEdge.id
                    nextNodeId = connectedEdge.source.toString() === currentNodeId.toString() ? connectedEdge.target : connectedEdge.source
                }
            }

            packet.sourceMac = currentNode.data.mac 
        } else {
            const connectedEdge = edges.find(e => 
                (e.source.toString() === currentNodeId.toString() || e.target.toString() === currentNodeId.toString())
            )
            if (connectedEdge) {
                nextEdgeId = connectedEdge.id
                nextNodeId = connectedEdge.source.toString() === currentNodeId.toString() ? connectedEdge.target : connectedEdge.source
            } else {
                dropPacket(packet.id, 'Destination unreachable')
                return { success: false }
            }
        }

        if (!nextEdgeId || !nextNodeId) {
            dropPacket(packet.id, 'No path forward')
            return { success: false }
        }

        const hopLatency = 400 + Math.floor(Math.random() * 200) // Slower for visual
        latency += hopLatency

        usePacketStore.getState().updatePacket(packet.id, (current) => ({
            ...current,
            previousLocation: currentNodeId,
            currentLocation: nextNodeId,
            currentHopLatency: hopLatency,
            incomingEdgeId: nextEdgeId
        }))

        setActiveEdges([nextEdgeId])
        await delay(hopLatency)
        setActiveEdges([])

        const targetNode = nodes.find(n => n.id.toString() === nextNodeId.toString())
        if (targetNode?.type === 'switchNode') {
            useSwitchStore.getState().learnMac(
                nextNodeId.toString(), 
                packet.sourceMac, 
                nextEdgeId, 
                packet.vlan || 1
            )
        }

        packet.previousLocation = currentNodeId
        packet.incomingEdgeId = nextEdgeId
        currentNodeId = nextNodeId
    }

    if (ttl <= 0) {
        dropPacket(packet.id, 'TTL Expired')
    } else {
        dropPacket(packet.id, 'Max Hops Exceeded')
    }
    return { success: false }
}

async function simulateHopByHopBranch(packet, nextNodeId, nextEdgeId, nodes, edges, routingTables, setActiveEdges, setEdgeStatus) {
    const hopLatency = 20 + Math.floor(Math.random() * 50)
    setActiveEdges([nextEdgeId])
    await delay(hopLatency)
    setActiveEdges([])

    const targetNode = nodes.find(n => n.id.toString() === nextNodeId.toString())
    if (targetNode?.type === 'switchNode') {
        useSwitchStore.getState().learnMac(
            nextNodeId.toString(), 
            packet.sourceMac, 
            nextEdgeId, 
            packet.vlan || 1
        )
    }

    packet.previousLocation = packet.currentLocation
    packet.currentLocation = nextNodeId
    packet.incomingEdgeId = nextEdgeId

    return simulateHopByHop({ packet, nodes, edges, routingTables, setActiveEdges, setEdgeStatus })
}

function dropPacket(id, reason) {
    useEventStore.getState().addEvent({
        type: 'NETWORK',
        severity: 'ERROR',
        message: `PACKET DROPPED: ${reason}`
    })
    setTimeout(() => {
        usePacketStore.getState().removePacket(id)
    }, 1000)
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}