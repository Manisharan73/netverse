const networkService = require('./network.service')

async function createNetwork(req, res) {
    try {
        const network = await networkService.createNetwork(req.body)
        res.status(201).json(network)
    } catch(err) {
        res.status(500).json({
            error: err.message
        })
    }
}

async function getNetwork(req, res) {
    try {
        const networks = await networkService.getNetwork()
        res.json(networks)
    } catch(err) {
        res.status(500).json({
            error: err.message
        })
    }
}

async function getNetworkById(req, res) {
    try {
        const network = await networkService.getNetworkById(req.params.id)
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

module.exports = {
    createNetwork,
    getNetwork,
    getNetworkById,
    updateNetwork
}