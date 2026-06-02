const { getMacEntry, saveMacEntry } = require('./switch.service')

async function processSwitchHop({ switchNode, packet, networkId, io, edges, blockedEdges = [] }) {
    // 1. MAC Learning
    // If the packet has a valid source MAC, the switch learns which port it came from
    if (packet.sourceMac && packet.incomingEdgeId) {
        await saveMacEntry(networkId, switchNode.frontendId, packet.sourceMac, packet.incomingEdgeId)
        
        // Notify frontend UI to update MAC table
        io.to(`network:${networkId}`).emit('mac:updated', {
            switchId: switchNode.frontendId,
            macAddress: packet.sourceMac,
            port: packet.incomingEdgeId,
            learnedAt: Date.now()
        })
    }

    // 2. Forwarding Decision
    if (packet.destinationMac === 'FF:FF:FF:FF:FF:FF') {
        return floodPacket(switchNode, edges, packet.incomingEdgeId, blockedEdges)
    }

    const egressPort = await getMacEntry(networkId, switchNode.frontendId, packet.destinationMac)

    if (egressPort && !blockedEdges.includes(egressPort)) {
        // Targeted Forwarding
        const egressEdge = edges.find(e => e.id === egressPort)
        if (egressEdge) {
            return [egressEdge]
        }
    }

    // Unicast Flooding (MAC unknown)
    return floodPacket(switchNode, edges, packet.incomingEdgeId, blockedEdges)
}

function floodPacket(switchNode, edges, incomingEdgeId, blockedEdges) {
    return edges.filter(edge => {
        if (edge.id === incomingEdgeId) return false // Don't send back out the same port
        if (blockedEdges.includes(edge.id)) return false // Blocked by STP

        return edge.sourceNodeId === switchNode.frontendId || edge.targetNodeId === switchNode.frontendId
    })
}

module.exports = {
    processSwitchHop
}
