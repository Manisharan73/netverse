function buildAdjacencyGraph(nodes, edges) {
    const graph = {}

    nodes.forEach((node) => {
        graph[node.id] = []
    })

    edges.forEach((edge) => {
        const source = edge.sourceNodeId || edge.source
        const target = edge.targetNodeId || edge.target

        if (!graph[source]) graph[source] = []
        if (!graph[target]) graph[target] = []

        const weight = 1 // or edge.latency

        graph[source].push({ node: target, weight })
        graph[target].push({ node: source, weight })
    })

    return graph
}

function findShortestPath(graph, startNode, endNode) {
    const distances = {}
    const previous = {}
    const unvisited = new Set()

    for (const node in graph) {
        distances[node] = Infinity
        previous[node] = null
        unvisited.add(node)
    }

    distances[startNode] = 0

    while (unvisited.size > 0) {
        let currentNode = null
        let minDistance = Infinity

        for (const node of unvisited) {
            if (distances[node] < minDistance) {
                minDistance = distances[node]
                currentNode = node
            }
        }

        if (currentNode === null) {
            break
        }

        if (currentNode === endNode) {
            break
        }

        unvisited.delete(currentNode)

        const neighbors = graph[currentNode] || []
        for (const neighbor of neighbors) {
            if (!unvisited.has(neighbor.node)) continue

            const newDistance = distances[currentNode] + neighbor.weight

            if (newDistance < distances[neighbor.node]) {
                distances[neighbor.node] = newDistance
                previous[neighbor.node] = currentNode
            }
        }
    }

    const path = []
    let current = endNode

    while (current !== null) {
        path.unshift(current)
        current = previous[current]
    }

    if (path[0] === startNode) {
        return path
    }

    return null
}

module.exports = {
    buildAdjacencyGraph,
    findShortestPath
}
