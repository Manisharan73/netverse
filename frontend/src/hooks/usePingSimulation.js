import { useState } from 'react'
import { resolveDns } from '../utils/dns.utils'
import { isValidIp } from '../utils/network.utils'
import useNetworkStore from '../stores/network.store'
import { simulatePacketTraversal } from '../utils/packetSimulation'
import usePacketStore from '../stores/packet.store'
import useEventStore from '../stores/event.store'
import { PROTOCOL_PROFILES } from '../constants/protocolConfig'
import useArpStore from '../stores/arp.store'
import { resolveArp } from '../utils/arp.utils'
import useSwitchStore from '../stores/switch.store'
import useStpStore from '../stores/stp.store'
import { findSwitchesInPath } from '../utils/switch.utils'
import { requiresNat, performNat } from '../utils/nat.utils'
import { INTERNET_HOSTS } from '../constants/internet.config'
import useFirewallStore from '../stores/firewall.store'
import { buildEdgeMap } from '../utils/edge.utils'
import { validateConnectivity } from '../utils/networkValidation'
import { dispatchArpBroadcast, handlePacketFlow } from '../utils/packetFlow'
import { getTraversedEdges, calculateRouteLatency } from '../utils/route.utils'

export default function usePingSimulation({ nodes, edges, setEdges, getRoute, selectedNode, pingTarget }) {
    const [activeEdges, setActiveEdges] = useState([])
    const [edgeStatus, setEdgeStatus] = useState('success')

    const firewallRules = useFirewallStore((state) => state.rules)
    const addEvent = useEventStore((state) => state.addEvent)
    const addArpEntry = useArpStore((state) => state.addArpEntry)
    const getMac = useArpStore((state) => state.getMac)
    const learnMac = useSwitchStore((state) => state.learnMac)
    const blockedEdges = useStpStore((state) => state.blockedEdges)

    function simulateTraffic(path, protocolProfile, nodeMap) {
        const setNodeMetrics = useNetworkStore.getState().setNodeMetrics

        setNodeMetrics((currentMetrics) => {
            const nextMetrics = { ...currentMetrics }

            path.forEach((nodeId) => {
                const metric = nextMetrics[nodeId] || {}
                nextMetrics[nodeId] = {
                    ...metric,
                    traffic: (metric.traffic || 0) + protocolProfile.trafficWeight,
                    packetsSent: (metric.packetsSent || 0) + 1,
                    packetsReceived: (metric.packetsReceived || 0) + 1
                }

                const node = nodeMap.get(nodeId.toString())
                if (node?.type === 'switchNode') {
                    nextMetrics[nodeId] = {
                        ...nextMetrics[nodeId],
                        macTableEntries: Object.keys(
                            useSwitchStore.getState().macTable[nodeId] || {}
                        ).length
                    }
                }
            })

            return nextMetrics
        })
    }

    async function pingNode(packetType = 'ICMP') {
        if (!selectedNode || !pingTarget) return

        const broadcastPackets = usePacketStore.getState().packets.filter((packet) => packet.isBroadcast)
        if (broadcastPackets.length > 20) {
            addEvent({ type: 'STORM', severity: 'CRITICAL', message: 'Broadcast storm detected' })
            return
        }

        const nodeMap = new Map()
        nodes.forEach((node) => nodeMap.set(node.id.toString(), node))

        const edgeMap = buildEdgeMap(edges)

        let targetNode = nodeMap.get(pingTarget.toString())
        let finalIp = pingTarget

        if (!targetNode && !isValidIp(pingTarget)) {
            const resolvedIp = await resolveDns({ domain: pingTarget, addEvent })
            if (!resolvedIp) return
            finalIp = resolvedIp
        }

        if (!targetNode) {
            targetNode = nodes.find((node) => node.data.ip === finalIp)
        }

        if (!targetNode && INTERNET_HOSTS.includes(finalIp)) {
            targetNode = {
                id: 'internet',
                data: { label: 'Internet Host', ip: finalIp }
            }
        }

        let destinationId = targetNode?.id?.toString()
        if (destinationId === 'internet') {
            const router = nodes.find((node) => node.type === 'routerNode')
            if (router) destinationId = router.id.toString()
        }

        const path = getRoute(selectedNode.id.toString(), destinationId)

        const isValid = validateConnectivity({
            selectedNode, targetNode, packetType, firewallRules, path, nodes, addEvent
        })

        if (!isValid) return

        const { traversedEdges, blocked, failed } = getTraversedEdges({
            path, edgeMap, blockedEdges, addEvent
        })

        if (blocked || failed) return

        const protocolProfile = PROTOCOL_PROFILES[packetType]

        const arpPacket = dispatchArpBroadcast({ selectedNode, path, addEvent })

        let destinationMac = getMac(targetNode.data.ip)
        if (!destinationMac) {
            destinationMac = await resolveArp({ sourceNode: selectedNode, targetNode, addEvent, addArpEntry })
        }

        const switches = findSwitchesInPath({ path, nodes })
        switches.forEach((switchId) => {
            learnMac(switchId, selectedNode.data.mac, selectedNode.id, selectedNode.data.vlan || 1)
            learnMac(switchId, targetNode.data.mac, targetNode.id, targetNode.data.vlan || 1)
        })

        const { packet, dropped } = handlePacketFlow({
            packetType, selectedNode, targetNode, destinationMac, path, traversedEdges, edges, addEvent, setEdgeStatus, setActiveEdges
        })

        if (dropped) return

        simulateTraffic(path, protocolProfile, nodeMap)

        setEdges((currentEdges) =>
            currentEdges.map((edge) => {
                if (traversedEdges.includes(edge.id)) {
                    return { ...edge, data: { ...edge.data, traffic: (edge.data?.traffic || 0) + 25 } }
                }
                return edge
            })
        )

        const needsNat = requiresNat({ sourceIp: selectedNode.data.ip, targetIp: targetNode.data.ip })
        if (needsNat) {
            const router = nodes.find((node) => node.type === 'routerNode')
            if (!router?.data?.publicIp) {
                addEvent({ type: 'NAT', severity: 'ERROR', message: 'No public gateway available' })
                return
            }
            const translation = performNat({ sourceIp: selectedNode.data.ip, publicIp: router.data.publicIp })
            addEvent({ type: 'NAT', severity: 'INFO', message: `${translation.privateIp} translated to ${translation.publicIp}` })
        }

        let latency = calculateRouteLatency({ traversedEdges, edges, packet, protocolProfile })

        await simulatePacketTraversal({ path, nodes, edges, setActiveEdges, setEdgeStatus })

        if (latency > 150) {
            addEvent({ type: 'NETWORK', severity: 'WARNING', message: `High latency detected (${latency}ms)` })
        }

        setEdgeStatus('success')
        addEvent({
            type: 'PING',
            severity: 'SUCCESS',
            message: `Route: ${path.join(' → ')} Reply from ${targetNode.data.ip} time=${latency}ms`
        })
    }

    return { pingNode, activeEdges, edgeStatus }
}
