const dockerService = require('../../services/docker/docker.service')
const Node = require('../../models/node.model')
const { getIo } = require('../../websocket/socket.server')
const eventService = require('../../services/docker/event.service')

function emitContainerEvent(networkId, eventName, payload) {
    try {
        const io = getIo();
        io.to(`network:${networkId}`).emit(eventName, payload)
    } catch (err) {
        console.error('Failed to emit container event:', err.message)
    }
}

async function createNodeContainer(nodeId) {
    const node = await Node.findByPk(nodeId)
    if (!node) throw new Error(`Node ${nodeId} not found`)

    if (node.containerId) {
        return node
    }

    const info = await dockerService.createContainer(node)
    
    await node.update({
        containerId: info.Id,
        containerName: info.Name.replace('/', ''),
        containerImage: info.Config.Image,
        containerStatus: 'STOPPED',
        lastContainerSync: new Date()
    })

    emitContainerEvent(node.networkId, 'container_created', {
        nodeId: node.id,
        networkId: node.networkId,
        containerId: node.containerId,
        status: 'STOPPED'
    })

    eventService.logContainerCreated(node.networkId, node.id, { containerId: node.containerId })

    return node
}

async function startNodeContainer(nodeId) {
    const node = await Node.findByPk(nodeId);
    if (!node) throw new Error(`Node ${nodeId} not found`);
    if (!node.containerId) throw new Error(`Container not created for node ${nodeId}`)

    if (node.containerStatus === 'RUNNING') {
        return node
    }

    await dockerService.startContainer(node.containerId)

    await node.update({
        containerStatus: 'RUNNING',
        lastContainerSync: new Date()
    })

    emitContainerEvent(node.networkId, 'container_started', {
        nodeId: node.id,
        networkId: node.networkId,
        containerId: node.containerId,
        status: 'RUNNING'
    })

    eventService.logContainerStarted(node.networkId, node.id, { containerId: node.containerId })

    return node
}

async function stopNodeContainer(nodeId) {
    const node = await Node.findByPk(nodeId)
    if (!node) throw new Error(`Node ${nodeId} not found`)
    if (!node.containerId) throw new Error(`Container not created for node ${nodeId}`)

    if (node.containerStatus === 'STOPPED') {
        return node
    }

    await dockerService.stopContainer(node.containerId)

    await node.update({
        containerStatus: 'STOPPED',
        lastContainerSync: new Date()
    })

    emitContainerEvent(node.networkId, 'container_stopped', {
        nodeId: node.id,
        networkId: node.networkId,
        containerId: node.containerId,
        status: 'STOPPED'
    })

    eventService.logContainerStopped(node.networkId, node.id, { containerId: node.containerId })

    return node
}

async function restartNodeContainer(nodeId) {
    const node = await Node.findByPk(nodeId)
    if (!node) throw new Error(`Node ${nodeId} not found`)
    if (!node.containerId) throw new Error(`Container not created for node ${nodeId}`)

    await dockerService.restartContainer(node.containerId)

    await node.update({
        containerStatus: 'RUNNING',
        lastContainerSync: new Date()
    })

    emitContainerEvent(node.networkId, 'container_restarted', {
        nodeId: node.id,
        networkId: node.networkId,
        containerId: node.containerId,
        status: 'RUNNING'
    })

    eventService.logContainerRestarted(node.networkId, node.id, { containerId: node.containerId })

    return node
}

async function deleteNodeContainer(nodeId) {
    const node = await Node.findByPk(nodeId)
    if (!node) throw new Error(`Node ${nodeId} not found`)
    
    if (!node.containerId) {
        return node
    }

    await dockerService.removeContainer(node.containerId)

    const oldContainerId = node.containerId

    await node.update({
        containerId: null,
        containerName: null,
        containerStatus: 'NOT_CREATED',
        lastContainerSync: new Date()
    })

    emitContainerEvent(node.networkId, 'container_deleted', {
        nodeId: node.id,
        networkId: node.networkId,
        containerId: oldContainerId,
        status: 'NOT_CREATED'
    })

    eventService.logContainerDeleted(node.networkId, node.id, { containerId: oldContainerId })

    return node
}

async function inspectNodeContainer(nodeId) {
    const node = await Node.findByPk(nodeId);
    if (!node) throw new Error(`Node ${nodeId} not found`);
    if (!node.containerId) throw new Error(`Container not created for node ${nodeId}`)

    return await dockerService.inspectContainer(node.containerId)
}

async function executeNetworkOperation(networkId, operationFn) {
    const nodes = await Node.findAll({ where: { networkId } });
    
    let success = 0;
    let failed = 0;

    for (const node of nodes) {
        try {
            await operationFn(node.id);
            success++;
        } catch (err) {
            console.error(`Failed bulk operation for node ${node.id}:`, err);
            failed++;
        }
    }

    return { success, failed, total: nodes.length };
}

async function createNetworkContainers(networkId) {
    return await executeNetworkOperation(networkId, createNodeContainer);
}

async function startNetworkContainers(networkId) {
    return await executeNetworkOperation(networkId, startNodeContainer);
}

async function stopNetworkContainers(networkId) {
    return await executeNetworkOperation(networkId, stopNodeContainer);
}

async function restartNetworkContainers(networkId) {
    return await executeNetworkOperation(networkId, restartNodeContainer);
}

async function deleteNetworkContainers(networkId) {
    return await executeNetworkOperation(networkId, deleteNodeContainer);
}

module.exports = {
    createNodeContainer,
    startNodeContainer,
    stopNodeContainer,
    restartNodeContainer,
    deleteNodeContainer,
    inspectNodeContainer,
    createNetworkContainers,
    startNetworkContainers,
    stopNetworkContainers,
    restartNetworkContainers,
    deleteNetworkContainers
};
