export function buildEdgeMap(edges) {
    const edgeMap = new Map()

    edges.forEach((edge) => {
        edgeMap.set(
            `${edge.source}-${edge.target}`,
            edge
        )

        edgeMap.set(
            `${edge.target}-${edge.source}`,
            edge
        )

        edgeMap.set(edge.id, edge)
    })

    return edgeMap
}
