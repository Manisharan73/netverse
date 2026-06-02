import { useEffect } from 'react'
import { addEdge } from 'reactflow'
import socket from '../websocket/socket'
import usePacketStore from '../stores/packet.store'
import useEventStore from '../stores/event.store'
import useNetworkStore from '../stores/network.store'
import useArpStore from '../stores/arp.store'
import useSwitchStore from '../stores/switch.store'
import useStpStore from '../stores/stp.store'
import useFirewallStore from '../stores/firewall.store'
import useAlertStore from '../stores/alert.store'

export default function useNetworkSocket({ setNodes, setEdges, setSelectedNode }) {
    useEffect(() => {
        socket.on('connect', () => {
            console.log('Connected: ', socket.id)
        })

        socket.on('node:added', (node) => {
            setNodes((nodes) => {
                const exists = nodes.some(n => n.id.toString() === node.id.toString())
                if (exists) return nodes
                return [...nodes, node]
            })
        })

        socket.on('node:moved', (data) => {
            setNodes((currentNodes) =>
                currentNodes.map((node) => {
                    if (node.id.toString() === data.id.toString()) {
                        return {
                            ...node,
                            position: {
                                x: Number(data.position.x),
                                y: Number(data.position.y)
                            }
                        }
                    }

                    return node
                })
            )
        })

        socket.on('node:updated', (data) => {
            setNodes((currentNodes) =>
                currentNodes.map((node) => {
                    if (node.id.toString() === data.id.toString()) {
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                ip: data.ip || node.data.ip,
                                subnet: data.subnet || node.data.subnet,
                                gateway: data.gateway || node.data.gateway
                            }
                        }
                    }
                    return node
                })
            )

            setSelectedNode((prev) => {
                if (!prev || prev.id.toString() !== data.id.toString()) return prev
                return {
                    ...prev,
                    data: {
                        ...prev.data,
                        ip: data.ip || prev.data.ip,
                        subnet: data.subnet || prev.data.subnet,
                        gateway: data.gateway || prev.data.gateway
                    }
                }
            })
        })

        socket.on('edge:added', (edge) => {
            setEdges((edges) => {
                const exists = edges.some(e => 
                    e.source.toString() === edge.source.toString() && 
                    e.target.toString() === edge.target.toString()
                )
                if (exists) return edges
                return addEdge(edge, edges)
            })
        })

        socket.on('node:deleted', (data) => {
            setEdges((edges) =>
                edges.filter((edge) =>
                    edge.source.toString() !== data.id.toString()
                    &&
                    edge.target.toString() !== data.id.toString()
                )
            )

            setNodes((nodes) =>
                nodes.filter((node) => node.id.toString() !== data.id.toString())
            )
        })

        socket.on('edge:deleted', (data) => {
            setEdges((edges) => edges.filter((edge) => edge.id.toString() !== data.id.toString()))
        })

        socket.on('node:labelUpdated', (data) => {
            setNodes((currentNodes) =>
                currentNodes.map((node) => {
                    if (node.id.toString() === data.id.toString()) {
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                label: data.label
                            }
                        }
                    }

                    return node
                })
            )

            setSelectedNode((prev) => {
                if (!prev || prev.id.toString() !== data.id.toString()) {
                    return prev
                }

                return {
                    ...prev,
                    data: {
                        ...prev.data,
                        label: data.label
                    }
                }
            })
        })

        // Packet Simulation Events
        socket.on('packet:created', (packet) => {
            usePacketStore.getState().addPacket(packet)
        })

        socket.on('packet:moved', (data) => {
            const { id, previousLocation, currentLocation, incomingEdgeId, hopLatency } = data
            
            useNetworkStore.getState().setActiveEdges([incomingEdgeId])
            setTimeout(() => {
                useNetworkStore.getState().setActiveEdges([])
            }, hopLatency)

            usePacketStore.getState().updatePacket(id, (current) => ({
                ...current,
                previousLocation,
                currentLocation,
                incomingEdgeId,
                status: 'MOVING'
            }))
        })

        socket.on('packet:delivered', (data) => {
            useEventStore.getState().addEvent({
                type: 'PING',
                severity: 'SUCCESS',
                message: `Reply received: time=${data.latency}ms`
            })
            usePacketStore.getState().updatePacket(data.id, (current) => ({
                ...current,
                status: 'DELIVERED'
            }))
            setTimeout(() => {
                usePacketStore.getState().removePacket(data.id)
            }, 1000)
        })

        socket.on('packet:dropped', (data) => {
            useEventStore.getState().addEvent({
                type: 'NETWORK',
                severity: 'ERROR',
                message: `PACKET DROPPED: ${data.reason}`
            })
            usePacketStore.getState().updatePacket(data.id, (current) => ({
                ...current,
                status: 'DROPPED'
            }))
            setTimeout(() => {
                usePacketStore.getState().removePacket(data.id)
            }, 1000)
        })

        // ARP and MAC Table Sync
        socket.on('arp:updated', (data) => {
            useArpStore.getState().addArpEntry(data.sourceNodeId, data.ipAddress, data.macAddress)
        })

        socket.on('mac:updated', (data) => {
            useSwitchStore.getState().learnMac(data.switchId, data.macAddress, data.port, data.vlan || 1)
        })

        socket.on('stp:updated', (data) => {
            useStpStore.getState().setRootBridge(data.rootBridge)
            useStpStore.getState().setBlockedEdges(data.blockedEdges)
            useStpStore.getState().setPortStates(data.portStates)
        })

        socket.on('firewall:updated', (data) => {
            if (data.type === 'ADD') {
                useFirewallStore.getState().addRule(data.rule)
            } else if (data.type === 'REMOVE') {
                useFirewallStore.getState().removeRule(data.ruleId)
            }
        })

        socket.on('metrics:updated', (metrics) => {
            useNetworkStore.getState().setNodeMetrics((prev) => ({ ...prev, ...metrics }))
        })

        socket.on('alerts:created', (alerts) => {
            alerts.forEach(alert => useAlertStore.getState().addAlert(alert))
        })

        socket.on('incidents:created', (incidents) => {
            incidents.forEach(incident => useAlertStore.getState().addIncident(incident))
        })

        return () => {
            socket.off('connect')
            socket.off('node:added')
            socket.off('node:moved')
            socket.off('edge:added')
            socket.off('node:deleted')
            socket.off('edge:deleted')
            socket.off('node:labelUpdated')
            socket.off('packet:created')
            socket.off('packet:moved')
            socket.off('packet:delivered')
            socket.off('packet:dropped')
            socket.off('arp:updated')
            socket.off('mac:updated')
            socket.off('stp:updated')
            socket.off('node:updated')
            socket.off('firewall:updated')
            socket.off('metrics:updated')
            socket.off('alerts:created')
            socket.off('incidents:created')
        }
    }, [setNodes, setEdges, setSelectedNode])
}
