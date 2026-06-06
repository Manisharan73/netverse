const Node = require('../../models/node.model')
const { collectNodeMetrics } = require('../../simulation/metrics/metrics.engine')
const { broadcastNodeMetrics, broadcastNetworkMetrics } = require('../../websocket/metrics.events')
const { Op } = require('sequelize')

let metricsSchedulerInterval = null

async function runMetricsCollection() {
    try {
        const nodes = await Node.findAll({
            where: {
                containerId: { [Op.not]: null },
                containerStatus: 'RUNNING'
            }
        })

        const networkTotals = {}; 

        for (const node of nodes) {
            const metrics = await collectNodeMetrics(node);
            
            if (metrics.state === 'RUNNING') {
                const uptime = (node.uptime || 0) + 5;
                
                await node.update({
                    cpuLoad: metrics.cpuLoad,
                    memoryUsage: metrics.memoryUsage,
                    uptime: uptime,
                    metrics: {
                        bytesSent: metrics.bytesSent,
                        bytesReceived: metrics.bytesReceived,
                        packetsSent: metrics.packetsSent,
                        packetsReceived: metrics.packetsReceived
                    }
                });

                broadcastNodeMetrics(node.networkId, {
                    nodeId: node.id,
                    cpuLoad: metrics.cpuLoad,
                    memoryUsage: metrics.memoryUsage,
                    uptime: uptime,
                    bytesSent: metrics.bytesSent,
                    bytesReceived: metrics.bytesReceived,
                    status: 'RUNNING'
                });

                if (!networkTotals[node.networkId]) {
                    networkTotals[node.networkId] = { totalCpu: 0, totalMemory: 0, activeContainers: 0 };
                }
                networkTotals[node.networkId].totalCpu += metrics.cpuLoad;
                networkTotals[node.networkId].totalMemory += metrics.memoryUsage;
                networkTotals[node.networkId].activeContainers += 1;
            }
        }

        for (const [networkId, totals] of Object.entries(networkTotals)) {
            broadcastNetworkMetrics(networkId, {
                networkId,
                totalCpu: totals.totalCpu,
                totalMemory: totals.totalMemory,
                activeContainers: totals.activeContainers
            });
        }
    } catch (err) {
        console.error('Error in metrics scheduler:', err);
    }
}

function startMetricsScheduler() {
    if (metricsSchedulerInterval) {
        console.log('Metrics scheduler is already running.');
        return;
    }
    
    console.log('Starting container metrics scheduler (5s interval)...');
    metricsSchedulerInterval = setInterval(runMetricsCollection, 5000);
}

function stopMetricsScheduler() {
    if (metricsSchedulerInterval) {
        clearInterval(metricsSchedulerInterval);
        metricsSchedulerInterval = null;
        console.log('Metrics scheduler stopped.');
    }
}

module.exports = {
    startMetricsScheduler,
    stopMetricsScheduler
};
