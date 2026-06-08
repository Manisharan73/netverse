class MonitoringRegistry {
    constructor() {
        // Map<networkId, Map<nodeId, metrics>>
        this.networks = new Map()
        // Map<networkId, intervalId>
        this.intervals = new Map()
    }

    initNetwork(networkId) {
        if (!this.networks.has(networkId)) {
            this.networks.set(networkId, new Map())
        }
    }

    setMetrics(networkId, nodeId, data) {
        this.initNetwork(networkId)
        const networkMetrics = this.networks.get(networkId)
        networkMetrics.set(nodeId, {
            ...data,
            lastUpdated: Date.now()
        })
    }

    getMetrics(networkId, nodeId) {
        if (!this.networks.has(networkId)) return null
        return this.networks.get(networkId).get(nodeId) || null
    }

    getNetworkMetrics(networkId) {
        if (!this.networks.has(networkId)) return []
        const metrics = []
        for (const [nodeId, data] of this.networks.get(networkId).entries()) {
            metrics.push({ nodeId, ...data })
        }
        return metrics
    }

    removeNetwork(networkId) {
        this.networks.delete(networkId)
        this.clearInterval(networkId)
    }

    setInterval(networkId, intervalId) {
        this.intervals.set(networkId, intervalId)
    }

    clearInterval(networkId) {
        if (this.intervals.has(networkId)) {
            clearInterval(this.intervals.get(networkId))
            this.intervals.delete(networkId)
        }
    }

    hasInterval(networkId) {
        return this.intervals.has(networkId)
    }
}

module.exports = new MonitoringRegistry()