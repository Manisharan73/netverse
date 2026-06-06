const dockerService = require('../../services/docker/docker.service')
const dockerHealth = require('../../services/docker/docker.health')
const nodeContainerService = require('../nodes/node.container.service')

async function health(req, res) {
    try {
        const result = await dockerHealth.checkDockerHealth()
        
        if (!result.healthy) {
            return res.status(503).json(result)
        }
        
        res.status(200).json(result)
    } catch(err) {
        console.error(err)
        res.status(500).json({
            healthy: false,
            error: err.message
        })
    }
}

async function createContainer(req, res) {
    try {
        const node = await nodeContainerService.createNodeContainer(req.params.id)
        res.status(201).json({ success: true, node })
    } catch (err) {
        res.status(err.status || 500).json({ success: false, error: err.message })
    }
}

async function startContainer(req, res) {
    try {
        const node = await nodeContainerService.startNodeContainer(req.params.id)
        res.status(200).json({ success: true, node })
    } catch (err) {
        res.status(err.status || 500).json({ success: false, error: err.message })
    }
}

async function stopContainer(req, res) {
    try {
        const node = await nodeContainerService.stopNodeContainer(req.params.id)
        res.status(200).json({ success: true, node })
    } catch (err) {
        res.status(err.status || 500).json({ success: false, error: err.message })
    }
}

async function restartContainer(req, res) {
    try {
        const node = await nodeContainerService.restartNodeContainer(req.params.id)
        res.status(200).json({ success: true, node })
    } catch (err) {
        res.status(err.status || 500).json({ success: false, error: err.message })
    }
}

async function deleteContainer(req, res) {
    try {
        const node = await nodeContainerService.deleteNodeContainer(req.params.id)
        res.status(200).json({ success: true, node })
    } catch (err) {
        res.status(err.status || 500).json({ success: false, error: err.message })
    }
}

async function inspectContainer(req, res) {
    try {
        const info = await nodeContainerService.inspectNodeContainer(req.params.id)
        res.status(200).json({ success: true, info })
    } catch (err) {
        res.status(err.status || 500).json({ success: false, error: err.message })
    }
}

module.exports = {
    health,
    createContainer,
    startContainer,
    stopContainer,
    restartContainer,
    deleteContainer,
    inspectContainer
}