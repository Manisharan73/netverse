import { useMemo } from "react"
import useStpStore from '../stores/stp.store'
import { buildAdjacencyGraph, findShortestPath } from '../utils/network.utils'

function useRoutingEngine(nodes, edges) {
    const blockedEdges = useStpStore((state) => state.blockedEdges)

    const graph = useMemo(() => {
        const activeEdges = edges.filter((edge) => {
            if (blockedEdges.includes(edge.id)) {
                return false
            }
            return true
        })
        return buildAdjacencyGraph(nodes, activeEdges)
    }, [nodes, edges, blockedEdges])

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
        getRoute,
        getRouteLatency
    }
}

export default useRoutingEngine