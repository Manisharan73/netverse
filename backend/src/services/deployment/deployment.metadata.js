const { Network, Node } = require('../../models')

class DeploymentMetadata {
    async markDeploying(networkId) {
        await Network.update(
            { deploymentStatus: 'DEPLOYING' },
            { where: { id: networkId } }
        )
    }

    async markDeployed(networkId, dockerNetworkId) {
        await Network.update(
            {
                deploymentStatus: 'DEPLOYED',
                dockerNetworkId,
                deployedAt: new Date()
            },
            { where: { id: networkId } }
        )
    }

    async markFailed(networkId) {
        await Network.update(
            { deploymentStatus: 'FAILED' },
            { where: { id: networkId } }
        )
    }

    async markNotDeployed(networkId) {
        await Network.update(
            {
                deploymentStatus: 'NOT_DEPLOYED',
                dockerNetworkId: null,
                deployedAt: null
            },
            { where: { id: networkId } }
        )
    }

    async updateNodeContainer(nodeId, data) {
        await Node.update(
            {
                containerId: data.containerId,
                containerStatus: data.containerStatus,
                containerName: data.containerName,
                lastContainerSync: new Date()
            },
            { where: { id: nodeId } }
        )
    }

    async clearNodeContainer(nodeId) {
        await Node.update(
            {
                containerId: null,
                containerStatus: 'NOT_CREATED',
                containerName: null,
                lastContainerSync: new Date()
            },
            { where: { id: nodeId } }
        )
    }
}

module.exports = new DeploymentMetadata()
