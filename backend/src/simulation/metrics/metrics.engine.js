const docker = require('../../services/docker/docker.client');

async function collectNodeMetrics(node) {
    if (!node.containerId) return { state: 'NOT_CREATED' };

    try {
        const container = docker.getContainer(node.containerId);
        const stats = await container.stats({ stream: false });
        
        let cpuLoad = 0;
        const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - (stats.precpu_stats?.cpu_usage?.total_usage || 0);
        const systemCpuDelta = stats.cpu_stats.system_cpu_usage - (stats.precpu_stats?.system_cpu_usage || 0);
        const numberCpus = stats.cpu_stats.online_cpus || stats.cpu_stats.cpu_usage.percpu_usage?.length || 1;
        
        if (systemCpuDelta > 0 && cpuDelta > 0) {
            cpuLoad = (cpuDelta / systemCpuDelta) * numberCpus * 100.0;
        }
        
        let memoryUsage = 0;
        if (stats.memory_stats.limit && stats.memory_stats.limit > 0) {
            const usedMemory = stats.memory_stats.usage - (stats.memory_stats.stats?.cache || 0);
            memoryUsage = (usedMemory / stats.memory_stats.limit) * 100.0;
        }
        
        let bytesSent = 0;
        let bytesReceived = 0;
        let packetsSent = 0;
        let packetsReceived = 0;
        
        if (stats.networks) {
            Object.values(stats.networks).forEach(net => {
                bytesSent += net.tx_bytes;
                bytesReceived += net.rx_bytes;
                packetsSent += net.tx_packets;
                packetsReceived += net.rx_packets;
            });
        }
        
        return {
            cpuLoad: parseFloat(cpuLoad.toFixed(2)),
            memoryUsage: parseFloat(memoryUsage.toFixed(2)),
            bytesSent,
            bytesReceived,
            packetsSent,
            packetsReceived,
            state: 'RUNNING'
        };
    } catch (err) {
        return { state: 'STOPPED' };
    }
}

module.exports = {
    collectNodeMetrics
};
