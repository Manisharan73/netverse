const FirewallRule = require('../../models/firewall_rule.model')

async function evaluatePacket(networkId, routerNodeId, packet) {
    const rules = await FirewallRule.findAll({ where: { networkId, nodeId: routerNodeId } })

    for (const rule of rules) {
        const sourceMatch = rule.sourceIp === 'ANY' || rule.sourceIp === packet.sourceIp
        const targetMatch = rule.targetIp === 'ANY' || rule.targetIp === packet.destinationIp
        const protocolMatch = rule.protocol === 'ANY' || rule.protocol === packet.type

        if (sourceMatch && targetMatch && protocolMatch) {
            return rule.action === 'ALLOW'
        }
    }

    return true // Implicit allow by default if no rules match
}

module.exports = {
    evaluatePacket
}
