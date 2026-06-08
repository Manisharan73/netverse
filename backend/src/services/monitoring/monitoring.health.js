const docker = require('../docker/docker.client')

class MonitoringHealth {
    async isContainerRunning(containerId) {
        if (!containerId) {
            return 'OFFLINE'
        }

        try {
            const container = docker.getContainer(containerId)
            const info = await container.inspect()
            
            if (info.State.Running) {
                return 'ONLINE'
            } else {
                return 'OFFLINE'
            }
        } catch (err) {
            if (err.statusCode === 404) {
                return 'OFFLINE'
            }
            console.error(`Failed to check container health ${containerId}:`, err.message)
            return 'DEGRADED'
        }
    }
}

module.exports = new MonitoringHealth()
