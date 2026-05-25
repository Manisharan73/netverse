import { useState, useEffect } from 'react'
import { isValidIp, isCrossSubnet, isNodeReachable } from '../utils/network.utils'
import useNetworkStore from '../stores/network.store'
import { simulatePacketTraversal } from '../utils/packetSimulation'

export default function usePingSimulation({
    nodes,
    edges,
    setEdges,
    graph,
    getRoute,
    getRouteLatency,
    selectedNode,
    pingTarget,
    setLogs
}) {
    const [activeEdges, setActiveEdges] = useState([])
    const [edgeStatus, setEdgeStatus] = useState('success')

    function simulateTraffic(path) {
        const setNodeMetrics = useNetworkStore.getState().setNodeMetrics

        setNodeMetrics((currentMetrics) => {
            const nextMetrics = { ...currentMetrics }

            path.forEach((nodeId) => {
                const metric = nextMetrics[nodeId] || {}
                nextMetrics[nodeId] = {
                    ...metric,
                    traffic: (metric.traffic || 0) + Math.floor(Math.random() * 40),
                    packetsSent: (metric.packetsSent || 0) + 1,
                    packetsReceived: (metric.packetsReceived || 0) + 1
                }
            })

            return nextMetrics
        })
    }

    async function pingNode() {
        if (!selectedNode || !pingTarget) {
            return
        }

        const targetNode = nodes.find(
            (node) => node.id.toString() === pingTarget.toString()
        )

        if (!targetNode) {
            return
        }

        if (!isValidIp(selectedNode.data.ip) || !isValidIp(targetNode.data.ip)) {
            const timeStamp = new Date().toLocaleTimeString()

            setLogs((prev) => [
                `[${timeStamp}] Invalid IP configuration`,
                ...prev
            ])

            return
        }

        const path = getRoute(
            selectedNode.id.toString(),
            targetNode.id.toString()
        )

        if (!path) {
            const timeStamp =
                new Date().toLocaleTimeString()

            setLogs((prev) => [
                `[${timeStamp}] Destination unreachable`,
                ...prev
            ])

            return
        }

        const reachable = isNodeReachable(path, nodes)

        if (!reachable) {
            const timeStamp = new Date().toLocaleTimeString()

            setLogs((prev) => [
                `[${timeStamp}] Route contains offline node`,
                ...prev
            ])

            return
        }

        const traversedEdges = []

        for (let i = 0; i < path.length - 1; i++) {
            const source = path[i]
            const target = path[i + 1]

            const edge = edges.find(
                (edge) =>
                    (edge.source.toString() === source.toString() && edge.target.toString() === target.toString())

                    ||

                    (edge.source.toString() === target.toString() && edge.target.toString() === source.toString())
            )

            if (!edge) {
                continue
            }

            if (edge.data?.status === 'OFFLINE') {
                const timeStamp = new Date().toLocaleTimeString()

                setLogs((prev) => [
                    `[${timeStamp}] Link failure detected`,
                    ...prev
                ])

                return
            }

            traversedEdges.push(edge.id)
        }

        simulateTraffic(path)



        setEdges((currentEdges) =>
            currentEdges.map((edge) => {
                if (traversedEdges.includes(edge.id)) {
                    const currentTraffic = edge.data?.traffic || 0

                    return {
                        ...edge,
                        data: {
                            ...edge.data,
                            traffic: currentTraffic + 25
                        }
                    }
                }

                return edge
            })
        )

        const containsRouter = path.some((nodeId) => {
            const node = nodes.find(
                (n) => n.id.toString() === nodeId.toString()
            )

            if (node?.type === 'routerNode') {
                return node.data.ip === selectedNode.data.gateway
            }
            return false
        })

        const sameSubnet = !isCrossSubnet(
            selectedNode.data.ip,
            targetNode.data.ip
        )

        if (!sameSubnet && !containsRouter) {
            const timeStamp =
                new Date().toLocaleTimeString()

            setLogs((prev) => [
                `[${timeStamp}] No router available for cross-network routing`,
                ...prev
            ])

            return
        }

        const latency = getRouteLatency(path)

        await simulatePacketTraversal({
            path,
            nodes,
            edges,

            setActiveEdges,
            setLogs,
            setEdgeStatus
        })

        const timeStamp = new Date().toLocaleTimeString()

        setEdgeStatus('success')

        setLogs((prev) => [
            `[${timeStamp}] Route: ${path.join(' → ')} Network: ${sameSubnet ? 'Local Network' : 'Cross Network Routing'} Reply from ${targetNode.data.ip} time=${latency}ms`,
            ...prev
        ])
    }

    return {
        pingNode,
        activeEdges,
        edgeStatus
    }
}
