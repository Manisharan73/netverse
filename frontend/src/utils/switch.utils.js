export function findSwitchesInPath({ path, nodes }) {
    return path.filter((nodeId) => {
        const node = nodes.find(
            (n) => n.id.toString() === nodeId.toString()
        )

        return (node?.type === 'switchNode')
    })
}

export function floodPacket({ switchId, edges }) {
    return edges.filter((edge) => edge.source === switchId || edge.target === switchId)
}