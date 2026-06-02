const { getArpEntry, saveArpEntry } = require('./arp.service')
const { createPacket } = require('../engine/packet.engine')

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function resolveArp({ networkId, sourceNode, targetIp, io, nodes }) {
    // 1. Check local cache (DB)
    let mac = await getArpEntry(networkId, sourceNode.frontendId, targetIp)
    if (mac) {
        return mac
    }

    // 2. Broadcast ARP Request
    const packet = createPacket({
        sourceId: sourceNode.frontendId,
        targetId: 'broadcast', // Target ID doesn't matter for broadcast
        type: 'ARP',
        sourceIp: sourceNode.ipAddress,
        destinationIp: targetIp,
        sourceMac: sourceNode.macAddress,
        destinationMac: 'FF:FF:FF:FF:FF:FF',
        isBroadcast: true
    })

    io.to(`network:${networkId}`).emit('packet:created', packet)

    // Notify frontend of ARP request
    io.to(`network:${networkId}`).emit('event:created', {
        type: 'ARP',
        severity: 'INFO',
        message: `ARP Request: Who has ${targetIp}?`
    })

    // Simulate propagation delay for the broadcast and reply
    // Real implementation would hop-by-hop flood the ARP packet via Switches
    // For now, we simulate a 800ms delay representing travel time to target and back.
    await delay(800)

    const targetNode = nodes.find(n => n.ipAddress === targetIp)
    if (!targetNode) {
        return null // No node has this IP
    }

    mac = targetNode.macAddress

    // 3. Save resolved MAC
    await saveArpEntry(networkId, sourceNode.frontendId, targetIp, mac)

    // Notify frontend of ARP reply
    io.to(`network:${networkId}`).emit('event:created', {
        type: 'ARP',
        severity: 'SUCCESS',
        message: `${targetIp} is at ${mac}`
    })

    // Notify frontend to update UI tables
    io.to(`network:${networkId}`).emit('arp:updated', {
        sourceNodeId: sourceNode.frontendId,
        ipAddress: targetIp,
        macAddress: mac,
        learnedAt: Date.now()
    })

    return mac
}

module.exports = {
    resolveArp
}
