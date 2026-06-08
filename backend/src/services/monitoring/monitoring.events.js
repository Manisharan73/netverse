const { Node } = require('../../models')
const { emitNodeOnline, emitNodeOffline } = require('../../websocket/metrics.events')

class MonitoringEvents {
    async handleStateChange(node, previousState, newState) {
        if (previousState === newState) return

        let dbStatus = node.status
        let containerStatus = node.containerStatus

        if (newState === 'ONLINE') {
            dbStatus = 'ONLINE'
            containerStatus = 'RUNNING'
            emitNodeOnline(node.networkId, node.id)
        } else if (newState === 'OFFLINE') {
            dbStatus = 'OFFLINE'
            containerStatus = 'STOPPED'
            emitNodeOffline(node.networkId, node.id)
        } else if (newState === 'DEGRADED') {
            dbStatus = 'DEGRADED'
        }

        try {
            await node.update({
                status: dbStatus,
                containerStatus: containerStatus
            })
            console.log(`Node ${node.id} state changed from ${previousState} to ${newState}`)
        } catch (err) {
            console.error(`Failed to update DB for node ${node.id} on state change:`, err.message)
        }
    }
}

module.exports = new MonitoringEvents()
