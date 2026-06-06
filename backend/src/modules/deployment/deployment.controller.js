const deploymentService = require('../../services/deployment/deployment.service')

class DeploymentController {
    async deployNetwork(req, res) {
        try {
            const { networkId } = req.params
            const result = await deploymentService.deployNetwork(networkId)
            res.status(200).json(result)
        } catch (err) {
            console.error('Deployment Controller Error - deployNetwork:', err)
            res.status(500).json({ error: err.message || 'Deployment failed' })
        }
    }

    async destroyNetwork(req, res) {
        try {
            const { networkId } = req.params
            const result = await deploymentService.destroyNetwork(networkId)
            res.status(200).json(result)
        } catch (err) {
            console.error('Deployment Controller Error - destroyNetwork:', err)
            res.status(500).json({ error: err.message || 'Destroy failed' })
        }
    }

    async restartNetwork(req, res) {
        try {
            const { networkId } = req.params
            const result = await deploymentService.restartNetwork(networkId)
            res.status(200).json(result)
        } catch (err) {
            console.error('Deployment Controller Error - restartNetwork:', err)
            res.status(500).json({ error: err.message || 'Restart failed' })
        }
    }

    async getDeploymentStatus(req, res) {
        try {
            const { networkId } = req.params
            const result = await deploymentService.getDeploymentStatus(networkId)
            res.status(200).json(result)
        } catch (err) {
            console.error('Deployment Controller Error - getDeploymentStatus:', err)
            res.status(500).json({ error: err.message || 'Failed to get deployment status' })
        }
    }

    async getNodeDeploymentStatus(req, res) {
        // Technically this delegates back to the verify logic if needed,
        // but currently we can fetch it via the Network status.
        // For individual node status, it might just check the DB or docker.
        try {
            // Future implementation if needed individually, but we can fetch it here.
            res.status(501).json({ error: 'Not implemented as standalone endpoint yet. Use getDeploymentStatus.' })
        } catch (err) {
            res.status(500).json({ error: err.message })
        }
    }
}

module.exports = new DeploymentController()