const { Network, Node, Edge } = require('../../models')
const deploymentWorkspace = require('./deployment.workspace')
const deploymentNetwork = require('./deployment.network')
const deploymentContainer = require('./deployment.container')
const deploymentMetadata = require('./deployment.metadata')
const deploymentVerify = require('./deployment.verify')
const deploymentCleanup = require('./deployment.cleanup')
const monitoringService = require('../monitoring/monitoring.service')
const { emitNetworkDeployed, emitNetworkDestroyed } = require('../../websocket/topology.events')

class DeploymentService {
    async deployNetwork(networkId) {
        try {
            const network = await Network.findByPk(networkId)
            if (!network) {
                throw new Error('Network not found')
            }

            if (network.deploymentStatus === 'DEPLOYED' || network.deploymentStatus === 'DEPLOYING') {
                throw new Error(`Network is already ${network.deploymentStatus.toLowerCase()}`)
            }

            const nodes = await Node.findAll({ where: { networkId } })

            await deploymentMetadata.markDeploying(networkId)

            await deploymentWorkspace.createNetworkWorkspace(networkId)
            for (const node of nodes) {
                await deploymentWorkspace.createNodeWorkspace(network, node)
            }

            const dockerNetworkInfo = await deploymentNetwork.createDockerNetwork(networkId)

            for (const node of nodes) {
                const containerInfo = await deploymentContainer.createContainer(node, network)
                await deploymentContainer.startContainer(node, network)
                
                await deploymentMetadata.updateNodeContainer(node.id, {
                    containerId: containerInfo.Id,
                    containerStatus: 'RUNNING',
                    containerName: containerInfo.Name.replace(/^\//, '')
                })
            }

            // 5. Verify deployment
            const verification = await deploymentVerify.verifyDeployment(network, nodes)
            if (!verification.deployed || !verification.running) {
                throw new Error('Deployment verification failed')
            }

            // 6. Mark DEPLOYED
            await deploymentMetadata.markDeployed(networkId, dockerNetworkInfo.Id)

            // 7. Start monitoring and emit events
            await monitoringService.startMonitoring(networkId)
            emitNetworkDeployed(networkId)

            return {
                success: true,
                status: 'DEPLOYED',
                verification
            }

        } catch (error) {
            console.error(`Deployment failed for network ${networkId}:`, error)
            await deploymentCleanup.cleanupEverything(networkId)
            await deploymentMetadata.markFailed(networkId)
            throw error
        }
    }

    async destroyNetwork(networkId) {
        const network = await Network.findByPk(networkId)
        if (!network) {
            throw new Error('Network not found')
        }

        await deploymentCleanup.cleanupEverything(networkId)

        monitoringService.stopMonitoring(networkId)
        emitNetworkDestroyed(networkId)

        return {
            success: true,
            status: 'NOT_DEPLOYED'
        }
    }

    async restartNetwork(networkId) {
        try {
            const network = await Network.findByPk(networkId)
            if (!network) {
                throw new Error('Network not found')
            }

            if (network.deploymentStatus !== 'DEPLOYED') {
                throw new Error('Network is not currently deployed')
            }

            const nodes = await Node.findAll({ where: { networkId } })
            
            for (const node of nodes) {
                await deploymentContainer.restartContainer(node, network)
                
                const verification = await deploymentVerify.verifyContainer(network, node)
                await deploymentMetadata.updateNodeContainer(node.id, {
                    containerId: verification.containerId,
                    containerStatus: verification.running ? 'RUNNING' : 'STOPPED',
                    containerName: `nv_${network.id}_${node.frontendId}`
                })
            }

            // Restart monitoring
            monitoringService.stopMonitoring(networkId)
            await monitoringService.startMonitoring(networkId)
            emitNetworkDeployed(networkId)

            return {
                success: true,
                status: 'DEPLOYED'
            }
        } catch (error) {
            console.error(`Restart failed for network ${networkId}:`, error)
            throw error
        }
    }

    async getDeploymentStatus(networkId) {
        const network = await Network.findByPk(networkId)
        if (!network) {
            throw new Error('Network not found')
        }

        const nodes = await Node.findAll({ where: { networkId } })
        const verification = await deploymentVerify.verifyDeployment(network, nodes)

        return {
            deploymentStatus: network.deploymentStatus,
            deployedAt: network.deployedAt,
            verification
        }
    }
}

module.exports = new DeploymentService()