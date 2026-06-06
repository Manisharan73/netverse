const dockerService = require('./docker.service')
const Node = require('../../models/node.model')
const { Op } = require('sequelize')

async function syncNodeContainer(node) {
    if (!node.containerId) {
        return node
    }

    try {
        const info = await dockerService.inspectContainer(node.containerId)
        
        const isRunning = info.State.Running
        const expectedStatus = isRunning ? 'RUNNING' : 'STOPPED'

        if (node.containerStatus !== expectedStatus) {
            await node.update({
                containerStatus: expectedStatus,
                lastContainerSync: new Date()
            })
        } else {
            await node.update({ lastContainerSync: new Date() });
        }
    } catch (err) {
        if (err.name === 'ContainerNotFoundError') {
            await node.update({
                containerId: null,
                containerName: null,
                containerStatus: 'NOT_CREATED',
                lastContainerSync: new Date()
            })
        } else if (err.name !== 'DockerUnavailableError') {
            console.error(`Error syncing container for node ${node.id}:`, err)
        }
    }

    return node
}

async function syncNetworkContainers(networkId) {
    const nodes = await Node.findAll({
        where: { networkId }
    })

    const results = []
    for (const node of nodes) {
        results.push(await syncNodeContainer(node))
    }

    return results
}

async function syncAllContainers() {
    try {
        const nodes = await Node.findAll({
            where: {
                containerId: {
                    [Op.not]: null
                }
            }
        })

        console.log(`Starting synchronization for ${nodes.length} containers...`)
        for (const node of nodes) {
            await syncNodeContainer(node)
        }
        console.log('Container synchronization complete.')
    } catch (err) {
        console.error('Failed to sync containers:', err)
    }
}

module.exports = {
    syncNodeContainer,
    syncNetworkContainers,
    syncAllContainers
}
