const Network = require('../../models/network.model')
const Node = require('../../models/node.model')
const Edge = require('../../models/edge.model')

// In-memory cache of blocked edges per network to save DB hits
const stpBlockedEdgesCache = {}

async function calculateStp(networkId, io) {
    const network = await Network.findByPk(networkId, {
        include: [Node, Edge]
    })

    if (!network) return

    const nodes = network.Nodes
    const edges = network.Edges

    const switches = nodes.filter(n => n.type === 'switchNode')
    if (switches.length === 0) {
        stpBlockedEdgesCache[networkId] = []
        return
    }

    // Simplified STP Logic based on MAC
    let rootBridge = switches[0]
    switches.forEach(sw => {
        if (sw.macAddress < rootBridge.macAddress) {
            rootBridge = sw
        }
    })

    const adj = {}
    switches.forEach(s => { adj[s.frontendId] = [] })

    edges.forEach(e => {
        const isSwitchEdge = switches.some(s => s.frontendId === e.sourceNodeId) && switches.some(s => s.frontendId === e.targetNodeId)
        if (isSwitchEdge) {
            adj[e.sourceNodeId]?.push({ target: e.targetNodeId, edgeId: e.id, cost: 19 })
            adj[e.targetNodeId]?.push({ target: e.sourceNodeId, edgeId: e.id, cost: 19 })
        }
    })

    const distances = {}
    const rootPorts = {}
    const switchPathCost = {}

    switches.forEach(s => {
        distances[s.frontendId] = Infinity
        switchPathCost[s.frontendId] = Infinity
    })

    distances[rootBridge.frontendId] = 0
    switchPathCost[rootBridge.frontendId] = 0

    const visited = new Set()

    while (visited.size < switches.length) {
        let current = null
        let minCost = Infinity

        Object.keys(distances).forEach(id => {
            if (!visited.has(id) && distances[id] < minCost) {
                minCost = distances[id]
                current = id
            }
        })

        if (!current) break
        visited.add(current)

        adj[current]?.forEach(neighbor => {
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

    const blockedEdges = []
    const portStates = {}

    edges.forEach(e => {
        const sourceIsSwitch = switches.some(s => s.frontendId === e.sourceNodeId)
        const targetIsSwitch = switches.some(s => s.frontendId === e.targetNodeId)

        if (!sourceIsSwitch || !targetIsSwitch) {
            portStates[e.id] = 'FORWARDING'
            return
        }

        const isRootPort = rootPorts[e.sourceNodeId] === e.id || rootPorts[e.targetNodeId] === e.id

        if (isRootPort) {
            portStates[e.id] = 'FORWARDING'
            return
        }

        const costSource = switchPathCost[e.sourceNodeId] !== undefined ? switchPathCost[e.sourceNodeId] : Infinity
        const costTarget = switchPathCost[e.targetNodeId] !== undefined ? switchPathCost[e.targetNodeId] : Infinity

        if (costSource !== costTarget) {
            // Lower cost becomes designated, other blocks
            blockedEdges.push(e.id)
            portStates[e.id] = 'BLOCKING'
        } else {
            // Tie breaker on MAC
            const sMac = switches.find(s => s.frontendId === e.sourceNodeId).macAddress
            const tMac = switches.find(s => s.frontendId === e.targetNodeId).macAddress
            // The one with higher MAC blocks
            blockedEdges.push(e.id)
            portStates[e.id] = 'BLOCKING'
        }
    })

    // Update Cache
    stpBlockedEdgesCache[networkId] = blockedEdges

    // Emit to frontend UI
    io.to(`network:${networkId}`).emit('stp:updated', {
        rootBridge: rootBridge.frontendId,
        blockedEdges,
        portStates
    })
}

function getBlockedEdges(networkId) {
    return stpBlockedEdgesCache[networkId] || []
}

module.exports = {
    calculateStp,
    getBlockedEdges
}
