const { simulatePing } = require('../simulation/engine/simulation.engine')
const { processDhcpRequest } = require('../simulation/dhcp/dhcp.engine')
const FirewallRule = require('../models/firewall_rule.model')

function setupPacketEvents(socket, io) {
    socket.on('dhcp:request', async (data) => {
        try {
            await processDhcpRequest(data.networkId, data.nodeId, io)
        } catch (err) {
            console.error('DHCP Error:', err)
        }
    })

    socket.on('firewall:addRule', async (data) => {
        try {
            const rule = await FirewallRule.create({
                networkId: data.networkId,
                nodeId: data.nodeId,
                action: data.rule.action,
                protocol: data.rule.protocol,
                sourceIp: data.rule.source,
                targetIp: data.rule.target
            })
            // Send back frontend format
            io.to(`network:${data.networkId}`).emit('firewall:updated', {
                type: 'ADD',
                rule: {
                    id: rule.id,
                    action: rule.action,
                    protocol: rule.protocol,
                    source: rule.sourceIp,
                    target: rule.targetIp
                }
            })
        } catch (err) {
            console.error('Firewall Add Error:', err)
        }
    })

    socket.on('firewall:removeRule', async (data) => {
        try {
            await FirewallRule.destroy({ where: { id: data.ruleId, networkId: data.networkId } })
            io.to(`network:${data.networkId}`).emit('firewall:updated', {
                type: 'REMOVE',
                ruleId: data.ruleId
            })
        } catch (err) {
            console.error('Firewall Remove Error:', err)
        }
    })

    socket.on('ping:start', async (data) => {
        // data should contain { networkId, sourceNodeId, destinationIp, type }
        console.log(`Received ping:start from ${data.sourceNodeId} to ${data.destinationIp}`)
        
        try {
            await simulatePing({
                networkId: data.networkId,
                sourceNodeId: data.sourceNodeId,
                destinationIp: data.destinationIp,
                type: data.type || 'ICMP',
                io
            })
        } catch (err) {
            console.error('Simulation error:', err)
        }
    })
}

module.exports = {
    setupPacketEvents
}
