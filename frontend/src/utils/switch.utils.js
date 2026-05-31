import useSwitchStore from '../stores/switch.store'

export function findSwitchesInPath({ path, nodes }) {
    return path.filter((nodeId) => {
        const node = nodes.find(
            (n) => n.id.toString() === nodeId.toString()
        )

        return (node?.type === 'switchNode')
    })
}

export function forwardPacket({ switchId, destinationMac, incomingEdgeId, edges, blockedEdges = [] }) {
    const entry = useSwitchStore.getState().getPort(switchId, destinationMac)

    if (!entry || destinationMac === 'FF:FF:FF:FF:FF:FF') {
        return floodPacket({ switchId, edges, incomingEdgeId, blockedEdges })
    }

    const portEdgeId = entry.port
    const egressEdge = edges.find(e => e.id === portEdgeId)

    if (!egressEdge || blockedEdges.includes(egressEdge.id) || egressEdge.data?.status === 'OFFLINE') {
        return []
    }

    return [egressEdge]
}

export function floodPacket({ switchId, edges, incomingEdgeId, blockedEdges = [] }) {
    return edges.filter((edge) => {
        if (edge.id === incomingEdgeId) return false
        if (blockedEdges.includes(edge.id)) return false
        if (edge.data?.status === 'OFFLINE') return false

        return edge.source.toString() === switchId.toString() || edge.target.toString() === switchId.toString()
    })
}