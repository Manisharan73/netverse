export function buildAdjacencyGraph(nodes, edges) {
    const graph = {}

    nodes.forEach((node) => {
        graph[node.id.toString()] = []
    })

    edges.forEach((edge) => {
        const edgeData = edge.data || {}

        if (edgeData.status === 'OFFLINE') {
            return
        }

        if (!graph[edge.source?.toString()] || !graph[edge.target?.toString()]) {
            return
        }

        const weight = edgeData.latency || 10

        graph[edge.source.toString()].push({
            target: edge.target.toString(),
            weight,
            edgeId: edge.id
        })

        graph[edge.target.toString()].push({
            target: edge.source.toString(),
            weight,
            edgeId: edge.id
        })
    })

    return graph
}

export function findShortestPath(graph, startNode, endNode) {
    const distances = {}
    const previous = {}
    const visited = new Set()

    Object.keys(graph).forEach((nodeId) => {
        distances[nodeId] = Infinity
        previous[nodeId] = null
    })

    distances[startNode] = 0

    while (true) {
        let currentNode = null
        let smallestDistance = Infinity

        Object.keys(graph).forEach((nodeId) => {
            if (!visited.has(nodeId) && distances[nodeId] < smallestDistance) {
                smallestDistance = distances[nodeId]
                currentNode = nodeId
            }
        })

        if (currentNode === null) {
            break
        }

        if (currentNode === endNode) {
            break
        }

        visited.add(currentNode)

        const neighbors = graph[currentNode] || []

        neighbors.forEach((neighbor) => {
            const newDistance = distances[currentNode] + neighbor.weight

            if (newDistance < distances[neighbor.target]) {
                distances[neighbor.target] = newDistance
                previous[neighbor.target] = currentNode
            }
        })
    }

    if (distances[endNode] === Infinity) {
        return null
    }

    const path = []

    let current = endNode

    while (current !== null) {
        path.unshift(current)
        current = previous[current]
    }

    return path
}

export function calculatePathLatency(path, nodes, edges, nodeMetrics) {
    if (!path || path.length === 0) {
        return Infinity
    }

    let totalLatency = 0

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

        const edgeData = edge.data || {}

        totalLatency += edgeData.latency || 10

        totalLatency += (edgeData.traffic || 0) / 10

        const metric = nodeMetrics[source] || {}

        if (metric.status === 'WARNING') {
            totalLatency += 50
        }

        if (metric.status === 'OFFLINE') {
            return Infinity
        }
    }

    return Math.floor(totalLatency)
}

export function isNodeReachable(path, nodes, nodeMetrics = {}) {
    if (!path) {
        return false
    }

    for (const nodeId of path) {
        const node = nodes.find(
            (node) => node.id.toString() === nodeId.toString()
        )

        if (!node) {
            return false
        }

        const metric = nodeMetrics[nodeId]

        if (metric?.status === 'OFFLINE') {
            return false
        }
    }

    return true
}

export function isCrossSubnet(sourceIp, targetIp) {
    if (!sourceIp || !targetIp) {
        return false
    }

    const sourceSubnet = sourceIp.split('.').slice(0, 3).join('.')

    const targetSubnet = targetIp.split('.').slice(0, 3).join('.')

    return sourceSubnet !== targetSubnet
}

export function getSubnet(ip) {
    if (!ip) {
        return ''
    }

    return ip.split('.').slice(0, 3).join('.')
}

export function getEdgeBetweenNodes(edges, source, target) {
    return edges.find(
        (edge) =>
            (edge.source.toString() === source.toString() && edge.target.toString() === target.toString())

            ||

            (edge.source.toString() === target.toString() && edge.target.toString() === source.toString())
    )
}

export function getPathEdges(path, edges) {
    const traversedEdges = []

    for (let i = 0; i < path.length - 1; i++) {
        const edge = getEdgeBetweenNodes(
            edges,
            path[i],
            path[i + 1]
        )

        if (edge) {
            traversedEdges.push(edge)
        }
    }

    return traversedEdges
}

export function hasRouterInPath(path, nodes) {
    return path.some((nodeId) => {
        const node = nodes.find(
            (node) => node.id.toString() === nodeId.toString()
        )

        return node?.type === 'routerNode'
    })
}

export function isValidIp(ip) {
    if (!ip) {
        return false
    }

    const regex = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/

    return regex.test(ip)
}