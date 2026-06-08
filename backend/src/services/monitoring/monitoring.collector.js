const docker = require('../docker/docker.client')
const { ContainerNotFoundError, DockerUnavailableError } = require('../docker/docker.errors')

class MonitoringCollector {
    async collectContainerStats(containerId) {
        if (!containerId) {
            return { state: 'NOT_CREATED' }
        }

        try {
            const container = docker.getContainer(containerId)
            const stats = await container.stats({ stream: false })
            
            let cpuUsage = 0
            const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - (stats.precpu_stats?.cpu_usage?.total_usage || 0)
            const systemCpuDelta = stats.cpu_stats.system_cpu_usage - (stats.precpu_stats?.system_cpu_usage || 0)
            const numberCpus = stats.cpu_stats.online_cpus || stats.cpu_stats.cpu_usage.percpu_usage?.length || 1
            
            if (systemCpuDelta > 0 && cpuDelta > 0) {
                cpuUsage = (cpuDelta / systemCpuDelta) * numberCpus * 100.0
            }
            
            let memoryUsage = 0
            if (stats.memory_stats.limit && stats.memory_stats.limit > 0) {
                const usedMemory = stats.memory_stats.usage - (stats.memory_stats.stats?.cache || 0)
                memoryUsage = (usedMemory / stats.memory_stats.limit) * 100.0
            }
            
            let networkRx = 0
            let networkTx = 0
            
            if (stats.networks) {
                Object.values(stats.networks).forEach(net => {
                    networkRx += net.rx_bytes
                    networkTx += net.tx_bytes
                })
            }
            
            return {
                cpuUsage: parseFloat(cpuUsage.toFixed(2)),
                memoryUsage: parseFloat(memoryUsage.toFixed(2)),
                networkRx,
                networkTx,
                state: 'RUNNING'
            }
        } catch (err) {
            if (err.statusCode === 404) {
                return { state: 'STOPPED' }
            }
            console.error(`Failed to collect stats for container ${containerId}:`, err.message)
            return { state: 'ERROR', error: err.message }
        }
    }
}

module.exports = new MonitoringCollector()
