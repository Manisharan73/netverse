const registry = require('../../services/monitoring/monitoring.registry')
const health = require('../../services/monitoring/monitoring.health')

class MonitoringController {
    async getNetworkMetrics(req, res) {
        try {
            const { networkId } = req.params
            const metrics = registry.getNetworkMetrics(networkId)
            
            res.json({
                success: true,
                data: metrics
            })
        } catch (error) {
            res.status(500).json({ success: false, message: error.message })
        }
    }

    async getNodeMetrics(req, res) {
        try {
            const { networkId, nodeId } = req.params
            const metrics = registry.getMetrics(networkId, nodeId)
            
            if (!metrics) {
                return res.status(404).json({ success: false, message: 'Node metrics not found' })
            }
            
            res.json({
                success: true,
                data: metrics
            })
        } catch (error) {
            res.status(500).json({ success: false, message: error.message })
        }
    }

    async getHealth(req, res) {
        try {
            res.json({
                success: true,
                status: 'ONLINE',
                activeNetworks: Array.from(registry.networks.keys())
            })
        } catch (error) {
            res.status(500).json({ success: false, message: error.message })
        }
    }
}

module.exports = new MonitoringController()
