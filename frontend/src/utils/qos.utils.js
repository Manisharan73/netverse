export function shouldDropPacket({ packet, edge }) {
    const packetLoss = edge.data?.packetLoss || 0

    const traffic = edge.data?.traffic || 0

    let dropChance = packetLoss

    if (traffic > 120) {
        dropChance += 0.15
    }

    if (packet.type === 'VOIP' && traffic > 80) {
        dropChance += 0.1
    }

    return Math.random() < dropChance
}

export function calculateQoSDelay({ packet, edge }) {
    const traffic = edge.data?.traffic || 0

    const baseLatency = edge.data?.latency || 10

    let jitter = 0

    if (traffic > 50) {
        jitter += Math.random() * 10
    }

    if (traffic > 100) {
        jitter += Math.random() * 30
    }

    if (traffic > 150) {
        jitter += Math.random() * 100
    }

    if (packet.type === 'VOIP') {
        jitter *= 1.5
    }

    return Math.floor(
        baseLatency + jitter
    )
}