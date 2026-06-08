const registry = require('./monitoring.registry')
const collector = require('./monitoring.collector')
const health = require('./monitoring.health')
const events = require('./monitoring.events')
const { emitMetricsUpdate } = require('../../websocket/metrics.events')
const { Node } = require('../../models')

class MonitoringService {
    async startMonitoring(networkId) {
        if (registry.hasInterval(networkId)) {
            console.log(`Monitoring is already running for network ${networkId}`)
            return
        }

        console.log(`Starting monitoring for network ${networkId}`)
        registry.initNetwork(networkId)

        const intervalId = setInterval(() => this.monitorNetwork(networkId), 5000)
        registry.setInterval(networkId, intervalId)

        // Perform immediate first check
        await this.monitorNetwork(networkId)
    }

    stopMonitoring(networkId) {
        console.log(`Stopping monitoring for network ${networkId}`)
        registry.removeNetwork(networkId)
    }

    async monitorNetwork(networkId) {
        try {
            const nodes = await Node.findAll({
                where: { networkId }
            })

            for (const node of nodes) {
                if (node.containerStatus !== 'NOT_CREATED') {
                    await this.monitorNode(node)
                }
            }
        } catch (err) {
            console.error(`Error monitoring network ${networkId}:`, err.message)
        }
    }

    async monitorNode(node) {
        try {
            const containerState = await health.isContainerRunning(node.containerId)
            
            // Check for state changes and update DB if needed
            await events.handleStateChange(node, node.status, containerState)

            if (containerState === 'ONLINE') {
                const stats = await collector.collectContainerStats(node.containerId)
                
                if (stats.state === 'RUNNING') {
                    const uptime = (node.uptime || 0) + 5
                    
                    const payload = {
                        networkId: node.networkId,
                        nodeId: node.id,
                        status: 'ONLINE',
                        cpuUsage: stats.cpuUsage,
                        memoryUsage: stats.memoryUsage,
                        networkRx: stats.networkRx,
                        networkTx: stats.networkTx,
                        uptime: uptime,
                        timestamp: Date.now()
                    }

                    // Update registry cache
                    registry.setMetrics(node.networkId, node.id, payload)

                    // Emit to websockets
                    emitMetricsUpdate(payload)

                    // Periodically update uptime in DB (optional, but good for keeping DB roughly in sync)
                    // We only do this every 60 seconds (12 intervals) to reduce DB writes
                    const intervalsSinceLastWrite = Math.floor(uptime / 5)
                    if (intervalsSinceLastWrite % 12 === 0) {
                        await node.update({ uptime })
                    }
                }
            }
        } catch (err) {
            console.error(`Error monitoring node ${node.id}:`, err.message)
        }
    }
}

module.exports = new MonitoringService()