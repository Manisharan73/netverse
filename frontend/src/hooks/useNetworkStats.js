import { useMemo } from 'react'

export default function useNetworkStats({ nodes, edges, nodeMetrics }) {
    return useMemo(() => {
        const routerCount = nodes.filter(
            (node) => node.type === 'routerNode'
        ).length

        const serverCount = nodes.filter(
            (node) => node.type === 'serverNode'
        ).length

        const onlineCount = nodes.filter(
            (node) => {
                const metric = nodeMetrics[node.id] || {}
                return metric.status === 'ONLINE'
            }
        ).length

        const offlineCount = nodes.filter(
            (node) => {
                const metric = nodeMetrics[node.id] || {}
                return metric.status === 'OFFLINE'
            }
        ).length

        const warningCount = nodes.filter(
            (node) => {
                const metric = nodeMetrics[node.id] || {}
                return metric.status === 'WARNING'
            }
        ).length

        const connectionCount = edges.length

        const healthScore = Math.max(0, 100 - (offlineCount * 25 + warningCount * 10))

        return {
            routerCount,
            serverCount,
            onlineCount,
            offlineCount,
            warningCount,
            connectionCount,
            healthScore
        }
    }, [nodes, edges, nodeMetrics])
}
