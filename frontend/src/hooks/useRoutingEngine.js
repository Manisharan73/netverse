import { useMemo } from "react"
import useStpStore from '../stores/stp.store'
import { buildAdjacencyGraph, findShortestPath } from '../utils/network.utils'

function useRoutingEngine(nodes, edges) {
    const blockedEdges = useStpStore((state) => state.blockedEdges)

    const graph = useMemo(() => {
        const activeEdges = edges.filter((edge) => !blockedEdges.includes(edge.id))
        return buildAdjacencyGraph(nodes, activeEdges)
    }, [nodes, edges, blockedEdges])

    const routingTables = useMemo(() => {
        const tables = {}
        const routers = nodes.filter(n => n.type === 'routerNode')
        
        routers.forEach(router => {
            tables[router.id] = []
            
            nodes.forEach(target => {
                if (router.id === target.id) return
                if (!target.data?.ip) return
                
                const targetSubnet = target.data.ip.split('.').slice(0, 3).join('.') + '.0/24'
                
                if (tables[router.id].some(r => r.destination === targetSubnet)) return
                
                const path = findShortestPath(graph, router.id.toString(), target.id.toString())
                if (path && path.length > 1) {
                    const nextHopId = path[1]
                    const nextHopNode = nodes.find(n => n.id.toString() === nextHopId)
                    tables[router.id].push({
                        destination: targetSubnet,
                        nextHop: nextHopNode?.data?.ip || nextHopId,
                        nextHopId: nextHopId,
                        metric: path.length - 1,
                        interface: edges.find(e => 
                            (e.source.toString() === router.id.toString() && e.target.toString() === nextHopId.toString()) || 
                            (e.target.toString() === router.id.toString() && e.source.toString() === nextHopId.toString())
                        )?.id
                    })
                }
            })
        })
        return tables
    }, [nodes, edges, graph])

    function getRoute(startNode, endNode) {
        if (!startNode || !endNode) {
            return null
        }

        return findShortestPath(
            graph,
            startNode.toString(),
            endNode.toString()
        )
    }

    function getRouteLatency(route) {
        if(!route) {
            return Infinity
        }

        return route.totalWeight
    }

    return {
        graph,
        routingTables,
        getRoute,
        getRouteLatency
    }
}

export default useRoutingEngine