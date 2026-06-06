const docker = require('../docker/docker.client')

class DeploymentNetwork {
    getNetworkName(networkId) {
        return `nv_${networkId}`
    }

    async createDockerNetwork(networkId) {
        const name = this.getNetworkName(networkId)
        
        try {
            const existingNetwork = docker.getNetwork(name)

            try {
                await existingNetwork.inspect()
                return await existingNetwork.inspect()
            } catch (err) {
                if (err.statusCode !== 404) {
                    throw err
                }
            }

            const network = await docker.createNetwork({
                Name: name,
                Driver: 'bridge',
                CheckDuplicate: true
            })

            return await network.inspect()
        } catch (err) {
            console.error(`Failed to create docker network for ${networkId}:`, err)
            throw err
        }
    }

    async removeDockerNetwork(networkId) {
        const name = this.getNetworkName(networkId)

        try {
            const network = docker.getNetwork(name)
            await network.remove()
        } catch (err) {
            if (err.statusCode !== 404) {
                console.error(`Failed to remove docker network for ${networkId}:`, err)
                throw err
            }
        }
    }

    async getDockerNetwork(networkId) {
        const name = this.getNetworkName(networkId)

        try {
            const network = docker.getNetwork(name)
            return await network.inspect()
        } catch (err) {
            if (err.statusCode === 404) {
                return null
            }

            throw err
        }
    }
}

module.exports = new DeploymentNetwork()