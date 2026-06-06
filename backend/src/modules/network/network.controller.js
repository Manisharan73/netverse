const networkService = require('./network.service')

async function createNetwork(req, res) {
    try {
        const network = await networkService.createNetwork(req.user.id, req.body)
        res.status(201).json(network)
    } catch(err) {
        res.status(500).json({
            error: err.message
        })
    }
}

async function getNetwork(req, res) {
    try {
        const networks = await networkService.getNetwork(req.user.id)
        res.json(networks)
    } catch(err) {
        res.status(500).json({
            error: err.message
        })
    }
}

async function getNetworkById(req, res) {
    try {
        const network = await networkService.getNetworkById(req.params.id, req.user.id)
        
        if (!network) {
            return res.status(404).json({ error: 'Network not found' })
        }
        
        res.json(network)
    } catch(err) {
        res.status(500).json({
            error: err.message
        })
    }
}

async function updateNetwork(req, res) {
    try {
        const network = await networkService.updateNetwork(
            req.params.id,
            req.user.id,
            req.body
        )

        res.json(network)
    } catch(err) {
        console.error(err)

        res.status(500).json({
            error: err.message
        })
    }
}

async function deleteNetwork(req, res) {
    try {
        await networkService.deleteNetwork(req.params.id, req.user.id)
        res.status(200).json({ success: true })
    } catch(err) {
        console.error(err)
        res.status(500).json({
            error: err.message
        })
    }
}

module.exports = {
    createNetwork,
    getNetwork,
    getNetworkById,
    updateNetwork,
    deleteNetwork
}