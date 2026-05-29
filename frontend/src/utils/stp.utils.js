export function electRootBridge(
    nodes
) {
    const switches = nodes.filter(
        (node) =>
            node.type ===
            'switchNode'
    )

    if (switches.length === 0) {
        return null
    }

    return switches
        .sort((a, b) =>
            a.id.localeCompare(b.id)
        )[0]
}

export function detectLoops(
    nodes,
    edges
) {
    const adjacency = {}

    nodes.forEach((node) => {
        adjacency[node.id] = []
    })

    edges.forEach((edge) => {
        if (
            edge.data?.status ===
            'OFFLINE'
        ) {
            return
        }

        adjacency[edge.source]
            .push(edge.target)

        adjacency[edge.target]
            .push(edge.source)
    })

    const visited = new Set()

    const blockedEdges = []

    function dfs(
        current,
        parent
    ) {
        visited.add(current)

        for (const neighbor of adjacency[current]) {
            if (neighbor === parent) {
                continue
            }

            if (visited.has(neighbor)) {
                const edge = edges.find(
                    (e) =>
                        (
                            e.source === current &&
                            e.target === neighbor
                        )

                        ||

                        (
                            e.source === neighbor &&
                            e.target === current
                        )
                )

                if (edge) {
                    blockedEdges.push(edge.id)
                }

                continue
            }

            dfs(neighbor, current)
        }
    }

    if (nodes.length > 0) {
        dfs(nodes[0].id, null)
    }

    return [...new Set(blockedEdges)]
}