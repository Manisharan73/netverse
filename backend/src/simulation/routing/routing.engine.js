const { buildAdjacencyGraph, findShortestPath } = require('./dijkstra')

function calculateRoutingTables(nodes, edges) {
    const tables = {}
    const routers = nodes.filter(n => n.type === 'routerNode')
    const activeEdges = edges // TODO: Filter blocked STP edges in Phase 3
    const graph = buildAdjacencyGraph(nodes, activeEdges)

    routers.forEach(router => {
        tables[router.id] = []
        
        nodes.forEach(target => {
            if (router.id === target.id) return
            if (!target.ipAddress) return
            
            const targetSubnet = target.ipAddress.split('.').slice(0, 3).join('.') + '.0/24'
            
            if (tables[router.id].some(r => r.destination === targetSubnet)) return
            
            const path = findShortestPath(graph, router.id.toString(), target.id.toString())
            if (path && path.length > 1) {
                const nextHopId = path[1]
                const nextHopNode = nodes.find(n => n.id.toString() === nextHopId)
                
                const connectingEdge = edges.find(e => 
                    (e.sourceNodeId.toString() === router.id.toString() && e.targetNodeId.toString() === nextHopId.toString()) || 
                    (e.targetNodeId.toString() === router.id.toString() && e.sourceNodeId.toString() === nextHopId.toString())
                )

                tables[router.id].push({
                    destination: targetSubnet,
                    nextHop: nextHopNode?.ipAddress || nextHopId,
                    nextHopId: nextHopId,
                    metric: path.length - 1,
                    interface: connectingEdge?.id
                })
            }
        })
    })

    return tables
}

module.exports = {
    calculateRoutingTables
}
