const DhcpLease = require('../../models/dhcp_lease.model')
const Node = require('../../models/node.model')

const DHCP_POOLS = [
    { network: '192.168.1', start: 100, end: 200, subnet: '255.255.255.0', gateway: '192.168.1.1' },
    { network: '10.0.0', start: 100, end: 200, subnet: '255.0.0.0', gateway: '10.0.0.1' }
]

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function processDhcpRequest(networkId, nodeId, io) {
    const node = await Node.findOne({ where: { networkId, frontendId: nodeId } })
    if (!node) return

    io.to(`network:${networkId}`).emit('event:created', {
        type: 'DHCP',
        severity: 'INFO',
        message: `${node.label} → DHCP DISCOVER`
    })

    await delay(500)

    for (const pool of DHCP_POOLS) {
        io.to(`network:${networkId}`).emit('event:created', {
            type: 'DHCP',
            severity: 'INFO',
            message: `DHCP SERVER → DHCP OFFER (${pool.network}.x)`
        })

        await delay(500)

        io.to(`network:${networkId}`).emit('event:created', {
            type: 'DHCP',
            severity: 'INFO',
            message: `${node.label} → DHCP REQUEST`
        })

        await delay(500)

        // Find available IP in this pool
        let allocatedIp = null
        for (let i = pool.start; i <= pool.end; i++) {
            const testIp = `${pool.network}.${i}`
            const existingLease = await DhcpLease.findOne({ where: { networkId, ipAddress: testIp } })
            
            if (!existingLease) {
                allocatedIp = testIp
                break
            }
        }

        if (allocatedIp) {
            // Found an IP! Save lease
            await DhcpLease.upsert({
                networkId,
                macAddress: node.macAddress || 'unknown-mac',
                ipAddress: allocatedIp,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
            })

            // Update Node DB
            node.ipAddress = allocatedIp
            node.subnet = pool.subnet
            node.gateway = pool.gateway
            await node.save()

            io.to(`network:${networkId}`).emit('event:created', {
                type: 'DHCP',
                severity: 'SUCCESS',
                message: `DHCP SERVER → DHCP ACK (${allocatedIp})`
            })

            // Tell frontend UI to update its node state
            io.to(`network:${networkId}`).emit('node:updated', {
                id: nodeId, // send back frontendId
                ip: allocatedIp,
                subnet: pool.subnet,
                gateway: pool.gateway
            })

            return
        }
    }

    io.to(`network:${networkId}`).emit('event:created', {
        type: 'DHCP',
        severity: 'ERROR',
        message: 'No DHCP addresses available'
    })
}

module.exports = {
    processDhcpRequest
}
