const path = require('path')
const docker = require('../docker/docker.client')

const RUNTIME_DIR = path.resolve(__dirname, '../../../../runtime/networks')

class DeploymentContainer {
    getContainerName(networkId, frontendId) {
        return `nv_${networkId}_${frontendId}`
    }

    getImageName(type) {
        switch (type) {
            case 'ROUTER': return 'netverse-router'
            case 'SWITCH': return 'netverse-switch'
            case 'SERVER': return 'netverse-server'
            case 'DNS': return 'netverse-dns'
            case 'DHCP': return 'netverse-dhcp'
            case 'HOST':
            case 'CLIENT': return 'netverse-client'
            default: return 'netverse-client'
        }
    }

    async createContainer(node, network) {
        const containerName = this.getContainerName(network.id, node.frontendId)
        const imageName = this.getImageName(node.type)
        const nodePath = path.join(RUNTIME_DIR, network.id, node.frontendId)

        // Ensure image exists (or attempt to pull/find it)
        // Note: For custom built images, they should be present locally.
        try {
            const containerConfig = {
                Image: imageName,
                name: containerName,
                Tty: true,
                OpenStdin: true,
                HostConfig: {
                    Binds: [
                        `${nodePath}/config.json:/etc/netverse/config.json:ro`,
                        `${nodePath}/startup.sh:/etc/netverse/startup.sh:ro`
                    ],
                    NetworkMode: `nv_${network.id}`
                },
                Entrypoint: ["/bin/sh", "/etc/netverse/startup.sh"],
                Labels: {
                    app: 'netverse',
                    networkId: network.id,
                    nodeId: node.id,
                    frontendId: node.frontendId,
                    type: node.type
                }
            }

            // Remove existing container if it exists
            try {
                const existingContainer = docker.getContainer(containerName)
                await existingContainer.remove({ force: true })
            } catch (err) {
                if (err.statusCode !== 404) {
                    throw err
                }
            }

            const container = await docker.createContainer(containerConfig)
            return await container.inspect()
        } catch (err) {
            console.error(`Failed to create container ${containerName}:`, err)
            throw err
        }
    }

    async startContainer(node, network) {
        const containerName = this.getContainerName(network.id, node.frontendId)
        try {
            const container = docker.getContainer(containerName)
            await container.start()
            return await container.inspect()
        } catch (err) {
            console.error(`Failed to start container ${containerName}:`, err)
            throw err
        }
    }

    async stopContainer(node, network) {
        const containerName = this.getContainerName(network.id, node.frontendId)
        try {
            const container = docker.getContainer(containerName)
            await container.stop()
            return await container.inspect()
        } catch (err) {
            console.error(`Failed to stop container ${containerName}:`, err)
            throw err
        }
    }

    async removeContainer(node, network) {
        const containerName = this.getContainerName(network.id, node.frontendId)
        try {
            const container = docker.getContainer(containerName)
            await container.remove({ force: true })
        } catch (err) {
            if (err.statusCode !== 404) {
                console.error(`Failed to remove container ${containerName}:`, err)
                throw err
            }
        }
    }

    async restartContainer(node, network) {
        const containerName = this.getContainerName(network.id, node.frontendId)
        try {
            const container = docker.getContainer(containerName)
            await container.restart()
            return await container.inspect()
        } catch (err) {
            console.error(`Failed to restart container ${containerName}:`, err)
            throw err
        }
    }
}

module.exports = new DeploymentContainer()
