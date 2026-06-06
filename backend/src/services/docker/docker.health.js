const dockerService = require('./docker.service');

async function checkDockerHealth() {
    try {
        const info = await dockerService.getDockerInfo();
        
        return {
            healthy: true,
            dockerVersion: info.ServerVersion,
            totalContainers: info.Containers,
            runningContainers: info.ContainersRunning
        }
    } catch (error) {
        return {
            healthy: false,
            dockerVersion: null,
            totalContainers: 0,
            runningContainers: 0,
            error: error.message
        }
    }
}

module.exports = {
    checkDockerHealth
}