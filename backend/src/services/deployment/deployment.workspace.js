const fs = require('fs/promises')
const path = require('path')

const RUNTIME_DIR = path.resolve(__dirname, '../../../../runtime/networks')

class DeploymentWorkspace {
    async createNetworkWorkspace(networkId) {
        const networkPath = path.join(RUNTIME_DIR, networkId)

        try {
            await fs.mkdir(networkPath, { recursive: true })
        } catch (err) {
            console.error(`Failed to create network workspace for ${networkId}:`, err)
            throw err
        }

        return networkPath
    }

    async createNodeWorkspace(network, node) {
        const nodePath = path.join(RUNTIME_DIR, network.id, node.frontendId)

        try {
            await fs.mkdir(nodePath, { recursive: true })

            // Generate startup.sh
            const startupScript = `#!/bin/sh\n\necho "NetVerse node starting..."\n\nsleep infinity\n`
            await fs.writeFile(path.join(nodePath, 'startup.sh'), startupScript, { mode: 0o755 })

            // Generate config.json
            const configJson = JSON.stringify({
                node: {
                    id: node.id,
                    frontendId: node.frontendId,
                    type: node.type,
                    ipAddress: node.ipAddress,
                    macAddress: node.macAddress
                },

                network: {
                    id: network.id,
                    name: network.name
                }
            }, null, 2)

            await fs.writeFile(path.join(nodePath, 'config.json'), configJson)
        } catch (err) {
            console.error(`Failed to create node workspace for ${node.frontendId}:`, err)
            throw err
        }

        return nodePath
    }

    async removeNetworkWorkspace(networkId) {
        const networkPath = path.join(RUNTIME_DIR, networkId)

        try {
            await fs.rm(networkPath, { recursive: true, force: true })
        } catch (err) {
            console.error(`Failed to remove network workspace for ${networkId}:`, err)
        }
    }
}

module.exports = new DeploymentWorkspace()