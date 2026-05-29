import { calculateQoSDelay } from './qos.utils'

export function getTraversedEdges({ path, edgeMap, blockedEdges, addEvent }) {
    const traversedEdges = []

    for (let i = 0; i < path.length - 1; i++) {
        const source = path[i]
        const target = path[i + 1]

        const edge = edgeMap.get(`${source}-${target}`)

        if (!edge) continue

        if (blockedEdges.includes(edge.id)) {
            addEvent({ type: 'STP', severity: 'WARNING', message: 'Packet blocked by STP' })
            return { traversedEdges: [], blocked: true, failed: false }
        }

        if (edge.data?.status === 'OFFLINE') {
            addEvent({ type: 'NETWORK', severity: 'ERROR', message: 'Link failure detected' })
            return { traversedEdges: [], blocked: false, failed: true }
        }

        traversedEdges.push(edge.id)
    }

    return { traversedEdges, blocked: false, failed: false }
}

export function calculateRouteLatency({ traversedEdges, edges, packet, protocolProfile }) {
    let latency = 0

    for (const edgeId of traversedEdges) {
        const edge = edges.find((e) => e.id === edgeId)
        latency += calculateQoSDelay({ packet, edge })
    }

    return Math.floor(latency * protocolProfile.latencyMultiplier)
}
