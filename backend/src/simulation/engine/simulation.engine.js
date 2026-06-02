const { createPacket } = require('./packet.engine')
const { resolveArp } = require('../arp/arp.engine')
const { processSwitchHop } = require('../switching/switching.engine')
const { resolveDns } = require('../dns/dns.engine')
const { getBlockedEdges } = require('../stp/stp.engine')
const { evaluatePacket } = require('../firewall/firewall.engine')
const { processNatOutbound } = require('../nat/nat.engine')
const Network = require('../../models/network.model')
const Node = require('../../models/node.model')
const Edge = require('../../models/edge.model')
const crypto = require('crypto')

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function processHop(packet, currentNodeId, { networkId, io, nodes, edges, routingTables }) {
    if (packet.ttl <= 0) {
        io.to(`network:${networkId}`).emit('packet:dropped', { id: packet.id, reason: 'TTL Expired' })
        return
    }

    const currentNode = nodes.find(n => n.frontendId === currentNodeId)
    if (!currentNode) {
        io.to(`network:${networkId}`).emit('packet:dropped', { id: packet.id, reason: 'Node offline' })
        return
    }

    if (currentNode.ipAddress === packet.destinationIp || packet.targetId === currentNodeId) {
        io.to(`network:${networkId}`).emit('packet:delivered', { id: packet.id, latency: (64 - packet.ttl) * 50 })
        return
    }

    let nextEdges = []
    const blockedEdges = getBlockedEdges(networkId)

    if (currentNode.type === 'switchNode') {
        nextEdges = await processSwitchHop({ switchNode: currentNode, packet, networkId, io, edges, blockedEdges })
    } else if (currentNode.type === 'routerNode') {
        // Phase 4: Firewall Enforcement
        const isAllowed = await evaluatePacket(networkId, currentNodeId, packet)
        if (!isAllowed) {
            io.to(`network:${networkId}`).emit('packet:dropped', { id: packet.id, reason: 'Firewall Blocked' })
            return
        }

        // Phase 4: NAT Translation
        packet = await processNatOutbound(networkId, currentNode, packet, io)

        const table = routingTables[currentNodeId] || []
        const targetSubnet = packet.destinationIp.split('.').slice(0, 3).join('.') + '.0/24'
        
        let route = table.find(r => r.destination === targetSubnet) || table.find(r => r.destination === '0.0.0.0/0')

        if (route) {
            const edge = edges.find(e => e.id === route.interface)
            if (edge) nextEdges = [edge]
        }
    } else {
        const edge = edges.find(e => 
            (e.sourceNodeId === currentNodeId || e.targetNodeId === currentNodeId) && e.id !== packet.incomingEdgeId
        )
        if (edge) nextEdges = [edge]
    }

    if (nextEdges.length === 0) {
        io.to(`network:${networkId}`).emit('packet:dropped', { id: packet.id, reason: 'Destination unreachable' })
        return
    }

    // Branching logic for flooding
    for (let i = 0; i < nextEdges.length; i++) {
        const nextEdge = nextEdges[i]
        const nextNodeId = nextEdge.sourceNodeId === currentNodeId ? nextEdge.targetNodeId : nextEdge.sourceNodeId
        
        let branchedPacket = packet
        if (i > 0) {
            // Duplicate packet for branch
            branchedPacket = { ...packet, id: crypto.randomUUID() }
            io.to(`network:${networkId}`).emit('packet:created', branchedPacket)
        }

        branchedPacket.previousLocation = currentNodeId
        branchedPacket.currentLocation = nextNodeId
        branchedPacket.incomingEdgeId = nextEdge.id
        branchedPacket.ttl -= 1

        const hopLatency = 400 + Math.floor(Math.random() * 200)

        io.to(`network:${networkId}`).emit('packet:moved', {
            id: branchedPacket.id,
            previousLocation: branchedPacket.previousLocation,
            currentLocation: branchedPacket.currentLocation,
            incomingEdgeId: branchedPacket.incomingEdgeId,
            hopLatency
        })

        // Process next hop asynchronously to allow concurrent branches
        setTimeout(() => {
            processHop(branchedPacket, nextNodeId, { networkId, io, nodes, edges, routingTables })
        }, hopLatency)
    }
}

async function simulatePing({ networkId, sourceNodeId, destinationIp, type, io }) {
    const network = await Network.findByPk(networkId, {
        include: [Node, Edge]
    })

    if (!network) throw new Error('Network not found')

    const nodes = network.Nodes
    const edges = network.Edges

    const sourceNode = nodes.find(n => n.frontendId === sourceNodeId)
    if (!sourceNode) throw new Error('Source node not found')

    // Phase 3: Pre-flight DNS
    let finalDestinationIp = destinationIp
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/
    if (!ipRegex.test(destinationIp)) {
        const resolved = await resolveDns(destinationIp, networkId, io)
        if (!resolved) return
        finalDestinationIp = resolved
    }

    let targetNode = nodes.find(n => n.ipAddress === finalDestinationIp)
    
    const routingTables = calculateRoutingTables(nodes, edges)

    // Pre-flight ARP Phase 2
    const isSameSubnet = targetNode && sourceNode.subnet && targetNode.subnet === sourceNode.subnet
    
    let nextHopIp = finalDestinationIp
    if (!isSameSubnet && targetNode) {
        nextHopIp = sourceNode.gateway
        if (!nextHopIp) {
            io.to(`network:${networkId}`).emit('event:created', { type: 'NETWORK', severity: 'ERROR', message: 'No default gateway configured' })
            return
        }
    }

    let destinationMac = await resolveArp({ networkId, sourceNode, targetIp: nextHopIp, io, nodes })
    if (!destinationMac) {
        io.to(`network:${networkId}`).emit('event:created', { type: 'NETWORK', severity: 'ERROR', message: `ARP failed for ${nextHopIp}. Destination unreachable.` })
        return
    }

    // ARP resolved, create actual packet
    const packet = createPacket({
        sourceId: sourceNode.frontendId,
        targetId: targetNode ? targetNode.frontendId : 'internet',
        type: type,
        sourceIp: sourceNode.ipAddress,
        destinationIp: finalDestinationIp,
        sourceMac: sourceNode.macAddress || '00:00:00:00:00:00',
        destinationMac: destinationMac
    })

    io.to(`network:${networkId}`).emit('packet:created', packet)

    // Kick off asynchronous hop processing
    processHop(packet, packet.currentLocation, { networkId, io, nodes, edges, routingTables })
}

module.exports = {
    simulatePing
}
