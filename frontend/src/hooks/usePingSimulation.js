import { useState, useRef, useEffect } from 'react'
import { resolveDns } from '../utils/dns.utils'
import { isValidIp } from '../utils/network.utils'
import useNetworkStore from '../stores/network.store'
import { simulateHopByHop } from '../utils/packetSimulation'
import usePacketStore from '../stores/packet.store'
import useEventStore from '../stores/event.store'
import { PROTOCOL_PROFILES } from '../constants/protocolConfig'
import useArpStore from '../stores/arp.store'
import { resolveArp } from '../utils/arp.utils'
import useSwitchStore from '../stores/switch.store'
import useStpStore from '../stores/stp.store'
import { INTERNET_HOSTS } from '../constants/internet.config'
import useFirewallStore from '../stores/firewall.store'
import createPacket from '../utils/createPacket'

export default function usePingSimulation({ nodes, edges, setEdges, routingTable, selectedNode, pingTarget }) {
    const addEvent = useEventStore((state) => state.addEvent)
    const addArpEntry = useArpStore((state) => state.addArpEntry)
    const getMac = useArpStore((state) => state.getMac)
    
    const nodesRef = useRef(nodes)
    const edgesRef = useRef(edges)
    const routingTableRef = useRef(routingTable)
    
    useEffect(() => {
        nodesRef.current = nodes
    }, [nodes])
    
    useEffect(() => {
        edgesRef.current = edges
    }, [edges])

    useEffect(() => {
        routingTableRef.current = routingTable
    }, [routingTable])

    async function pingNode(packetType = 'ICMP') {
        if (!selectedNode || !pingTarget) return

        const currentNodes = nodesRef.current
        const currentEdges = edgesRef.current
        const currentRoutingTable = routingTableRef.current

        let finalIp = pingTarget
        let targetNode = currentNodes.find(node => node.data.ip === finalIp)

        if (!targetNode && !isValidIp(pingTarget)) {
            const resolvedIp = await resolveDns({ domain: pingTarget, addEvent })
            if (!resolvedIp) return
            finalIp = resolvedIp
        }

        if (!targetNode) {
            targetNode = currentNodes.find((node) => node.data.ip === finalIp)
        }

        if (!targetNode && INTERNET_HOSTS.includes(finalIp)) {
            targetNode = {
                id: 'internet',
                data: { label: 'Internet Host', ip: finalIp, mac: '00:00:00:00:00:00' }
            }
        }

        if (!targetNode) {
            addEvent({ type: 'NETWORK', severity: 'ERROR', message: `Cannot reach ${finalIp}: Destination host unreachable` })
            return
        }

        const sourceIp = selectedNode.data.ip
        const isSameSubnet = targetNode.data?.subnet && selectedNode.data?.subnet && targetNode.data.subnet === selectedNode.data.subnet

        let nextHopIp = finalIp
        if (!isSameSubnet && targetNode.id !== 'internet') {
            nextHopIp = selectedNode.data.gateway
            if (!nextHopIp) {
                addEvent({ type: 'NETWORK', severity: 'ERROR', message: 'No default gateway configured' })
                return
            }
        }

        let destinationMac = getMac(selectedNode.id.toString(), nextHopIp)
        if (!destinationMac) {
            addEvent({ type: 'ARP', severity: 'INFO', message: `Resolving MAC for ${nextHopIp}` })
            const nextHopNode = currentNodes.find(n => n.data.ip === nextHopIp) || targetNode
            destinationMac = await resolveArp({ sourceNode: selectedNode, targetNode: nextHopNode, addEvent, addArpEntry })
            if (!destinationMac) {
                addEvent({ type: 'NETWORK', severity: 'ERROR', message: `ARP failed for ${nextHopIp}. Destination unreachable.` })
                return
            }
        }

        const packet = createPacket({
            sourceId: selectedNode.id,
            targetId: targetNode.id,
            type: packetType,
            sourceIp,
            destinationIp: finalIp,
            sourceMac: selectedNode.data.mac,
            destinationMac,
            vlan: selectedNode.data.vlan
        })

        usePacketStore.getState().addPacket(packet)

        const setActiveEdges = useNetworkStore.getState().setActiveEdges
        const setEdgeStatus = useNetworkStore.getState().setEdgeStatus

        addEvent({
            type: 'PING',
            severity: 'INFO',
            message: `Pinging ${finalIp} with 32 bytes of data`
        })

        const result = await simulateHopByHop({
            packet,
            nodes: currentNodes,
            edges: currentEdges,
            routingTables: currentRoutingTable || {},
            setActiveEdges,
            setEdgeStatus
        })

        if (result.success) {
            addEvent({
                type: 'PING',
                severity: 'SUCCESS',
                message: `Reply from ${finalIp}: time=${result.latency}ms`
            })
        }
    }

    return { pingNode }
}
