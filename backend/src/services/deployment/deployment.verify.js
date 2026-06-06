const docker = require('../docker/docker.client')

class DeploymentVerify {
    async verifyContainer(network, node) {
        const containerName = `nv_${network.id}_${node.frontendId}`
        try {
            const container = docker.getContainer(containerName)
            const info = await container.inspect()
            return {
                exists: true,
                running: info.State.Running,
                containerId: info.Id
            }
        } catch (err) {
            if (err.statusCode === 404) {
                return {
                    exists: false,
                    running: false,
                    containerId: null
                }
            }
            throw err
        }
    }

    async verifyNetwork(network) {
        const networkName = `nv_${network.id}`
        try {
            const dockerNetwork = docker.getNetwork(networkName)
            const info = await dockerNetwork.inspect()
            return {
                exists: true,
                dockerNetworkId: info.Id
            }
        } catch (err) {
            if (err.statusCode === 404) {
                return {
                    exists: false,
                    dockerNetworkId: null
                }
            }
            throw err
        }
    }

    async verifyDeployment(network, nodes) {
        const networkVerification = await this.verifyNetwork(network)
        
        let allDeployed = networkVerification.exists
        let allRunning = true
        const nodeStatuses = []

        for (const node of nodes) {
            const containerVerification = await this.verifyContainer(network, node)
            nodeStatuses.push({
                nodeId: node.id,
                frontendId: node.frontendId,
                ...containerVerification
            })

            if (!containerVerification.exists) {
                allDeployed = false
                allRunning = false
            } else if (!containerVerification.running) {
                allRunning = false
            }
        }

        return {
            deployed: allDeployed,
            running: allDeployed && allRunning,
            network: networkVerification,
            nodes: nodeStatuses
        }
    }
}

module.exports = new DeploymentVerify()
