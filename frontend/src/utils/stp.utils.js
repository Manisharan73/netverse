export function calculateStp(nodes, edges, bridgePriorities = {}) {
    const switches = nodes.filter((n) => n.type === 'switchNode')
    
    if (switches.length === 0) {
        return { rootBridge: null, blockedEdges: [], portStates: {} }
    }

    let rootBridge = switches[0]
    switches.forEach((sw) => {
        const priorityA = bridgePriorities[sw.id] || 32768
        const priorityRoot = bridgePriorities[rootBridge.id] || 32768
        
        if (priorityA < priorityRoot) {
            rootBridge = sw
        } else if (priorityA === priorityRoot) {
            if (sw.data.mac < rootBridge.data.mac) {
                rootBridge = sw
            }
        }
    })

    const adj = {}
    switches.forEach((s) => { adj[s.id] = [] })
    
    edges.forEach((e) => {
        if (e.data?.status === 'OFFLINE') return
        const isSwitchEdge = switches.some((s) => s.id === e.source) && switches.some((s) => s.id === e.target)
        if (isSwitchEdge) {
            adj[e.source]?.push({ target: e.target, edgeId: e.id, cost: e.data?.latency || 19 })
            adj[e.target]?.push({ target: e.source, edgeId: e.id, cost: e.data?.latency || 19 })
        }
    })

    const distances = {}
    const rootPorts = {}
    const switchPathCost = {}

    switches.forEach((s) => {
        distances[s.id] = Infinity
        switchPathCost[s.id] = Infinity
    })
    
    distances[rootBridge.id] = 0
    switchPathCost[rootBridge.id] = 0

    const visited = new Set()

    while (visited.size < switches.length) {
        let current = null
        let minCost = Infinity

        Object.keys(distances).forEach((id) => {
            if (!visited.has(id) && distances[id] < minCost) {
                minCost = distances[id]
                current = id
            }
        })

        if (!current) break
        visited.add(current)

        adj[current]?.forEach((neighbor) => {
            const newCost = distances[current] + neighbor.cost
            if (newCost < distances[neighbor.target]) {
                distances[neighbor.target] = newCost
                rootPorts[neighbor.target] = neighbor.edgeId
                switchPathCost[neighbor.target] = newCost
            } else if (newCost === distances[neighbor.target]) {
                if (current < (rootPorts[neighbor.target] || '')) {
                    rootPorts[neighbor.target] = neighbor.edgeId
                    switchPathCost[neighbor.target] = newCost
                }
            }
        })
    }

    const portStates = {}
    const blockedEdges = []

    edges.forEach((e) => {
        if (e.data?.status === 'OFFLINE') return
        
        const sourceIsSwitch = switches.some((s) => s.id === e.source)
        const targetIsSwitch = switches.some((s) => s.id === e.target)

        if (!sourceIsSwitch || !targetIsSwitch) {
            portStates[e.id] = 'FORWARDING'
            return
        }

        const isRootPort = rootPorts[e.source] === e.id || rootPorts[e.target] === e.id

        if (isRootPort) {
            portStates[e.id] = 'FORWARDING'
            return
        }

        const costSource = switchPathCost[e.source] !== undefined ? switchPathCost[e.source] : Infinity
        const costTarget = switchPathCost[e.target] !== undefined ? switchPathCost[e.target] : Infinity

        let designatedSwitch = null
        if (costSource < costTarget) {
            designatedSwitch = e.source
        } else if (costTarget < costSource) {
            designatedSwitch = e.target
        } else {
            const sPri = bridgePriorities[e.source] || 32768
            const tPri = bridgePriorities[e.target] || 32768
            if (sPri < tPri) {
                designatedSwitch = e.source
            } else if (tPri < sPri) {
                designatedSwitch = e.target
            } else {
                const sMac = switches.find((s) => s.id === e.source).data.mac
                const tMac = switches.find((s) => s.id === e.target).data.mac
                designatedSwitch = sMac < tMac ? e.source : e.target
            }
        }

        portStates[e.id] = 'BLOCKING'
        blockedEdges.push(e.id)
    })

    return { rootBridge, blockedEdges, portStates }
}