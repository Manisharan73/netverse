export const PROTOCOL_PROFILES = {
    ICMP: {
        latencyMultiplier: 1,
        trafficWeight: 5,
        color: '#22c55e',
        ttl: 3000
    },

    HTTP: {
        latencyMultiplier: 1.4,
        trafficWeight: 20,
        color: '#3b82f6',
        ttl: 5000
    },

    HTTPS: {
        latencyMultiplier: 1.8,
        trafficWeight: 25,
        color: '#a855f7',
        ttl: 5500
    },

    DNS: {
        latencyMultiplier: 0.6,
        trafficWeight: 3,
        color: '#f59e0b',
        ttl: 2000
    },

    VOIP: {
        latencyMultiplier: 0.8,
        trafficWeight: 12,
        color: '#ef4444',
        ttl: 1500,
        jitterSensitive: true
    }
}