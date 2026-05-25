import { useMemo } from "react"

import {
    buildAdjacencyGraph,
    findShortestPath
} from '../utils/network.utils'

function useRoutingEngine(nodes, edges) {
    const graph = useMemo(() => {
        return buildAdjacencyGraph(nodes, edges)
    }, [nodes, edges])

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