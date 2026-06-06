const deploymentContainer = require('./deployment.container')
const deploymentNetwork = require('./deployment.network')
const deploymentWorkspace = require('./deployment.workspace')
const deploymentMetadata = require('./deployment.metadata')
const { Node } = require('../../models')

class DeploymentCleanup {
    async cleanupContainers(networkId) {
        try {
            const nodes = await Node.findAll({ where: { networkId } })
            for (const node of nodes) {
                // To safely remove, we construct a dummy network object with just the id
                await deploymentContainer.removeContainer(node, { id: networkId })
                await deploymentMetadata.clearNodeContainer(node.id)
            }
        } catch (err) {
            console.error(`Failed to cleanup containers for network ${networkId}:`, err)
        }
    }

    async cleanupDockerNetwork(networkId) {
        try {
            await deploymentNetwork.removeDockerNetwork(networkId)
        } catch (err) {
            console.error(`Failed to cleanup docker network for ${networkId}:`, err)
        }
    }

    async cleanupWorkspace(networkId) {
        try {
            await deploymentWorkspace.removeNetworkWorkspace(networkId)
        } catch (err) {
            console.error(`Failed to cleanup workspace for network ${networkId}:`, err)
        }
    }

    async cleanupEverything(networkId) {
        // Idempotent cleanup in reverse order of deployment
        await this.cleanupContainers(networkId)
        await this.cleanupDockerNetwork(networkId)
        await this.cleanupWorkspace(networkId)
        await deploymentMetadata.markNotDeployed(networkId)
    }
}

module.exports = new DeploymentCleanup()
