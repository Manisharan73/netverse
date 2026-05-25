import { useState, useEffect } from 'react'
import useNetworkStore from '../stores/network.store'

export default function useRoutingTable({ nodes }) {
    const [routingTable, setRoutingTable] = useState([])

    useEffect(() => {
        const routes = []
        const currentMetrics = useNetworkStore.getState().nodeMetrics

        nodes.forEach((node) => {
            const metric = currentMetrics[node.id] || {}
            routes.push({
                node: node.data.label,
                ip: node.data.ip,
                subnet: node.data.subnet,
                gateway: node.data.gateway,
                status: metric.status || 'ONLINE'
            })
        })

        setRoutingTable(routes)
    }, [nodes]) // We only re-calculate when nodes change to avoid frequent updates, status can be slightly stale in routing table.

    return { routingTable }
}
