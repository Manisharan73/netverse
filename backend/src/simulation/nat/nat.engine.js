const NatSession = require('../../models/nat_session.model')
const { logEvent } = require('../events/events.service')
const { Op } = require('sequelize')

function isPrivateIp(ip) {
    if (!ip) return false
    return (
        ip.startsWith('10.') ||
        ip.startsWith('192.168.') ||
        ip.startsWith('172.')
    )
}

function requiresNat(sourceIp, targetIp) {
    return isPrivateIp(sourceIp) && !isPrivateIp(targetIp)
}

async function processNatOutbound(networkId, routerNode, packet, io) {
    if (!requiresNat(packet.sourceIp, packet.destinationIp)) {
        return packet // No NAT required
    }

    const publicIp = routerNode.ipAddress // Mocking that the router's IP is its public WAN IP
    if (!publicIp || isPrivateIp(publicIp)) {
        // If router itself doesn't have a public IP, we can't do NAT
        return packet
    }

    // Allocate a random port for PAT translation
    const publicPort = Math.floor(Math.random() * (65535 - 10000) + 10000)

    await NatSession.create({
        networkId,
        routerId: routerNode.frontendId,
        privateIp: packet.sourceIp,
        privatePort: 0, // ICMP doesn't use ports in our sim, mock it to 0
        publicIp,
        publicPort,
        protocol: packet.type
    })

    logEvent({
        networkId,
        type: 'NETWORK',
        severity: 'INFO',
        message: `NAT [PAT]: Translated ${packet.sourceIp} -> ${publicIp}:${publicPort}`,
        io
    })

    // Mutate packet for outbound
    packet.sourceIp = publicIp
    return packet
}

module.exports = {
    processNatOutbound
}
