export async function simulatePacketTraversal({ path, nodes, edges, setActiveEdges, setLogs, setEdgeStatus }) {
    let latency = 0

    let ttl = path.length + 2

    for (let i = 0; i < path.length; i++) {
        ttl--

        if (ttl <= 0) {
            setEdgeStatus('failed')

            setLogs((prev) => [
                '[TTL EXPIRED] Packet Dropped',
                ...prev
            ])

            return false
        }

        const source = path[i]
        const target = path[i + 1]

        const edge = edges.find(
            (edge) =>
                (edge.source.toString() === source.toString() && edge.target.toString() === target.toString())

                ||

                (edge.source.toString() === target.toString() && edge.target.toString() === source.toString())
        )

        if (!edge) {
            continue
        }

        const hopLatency = 20 + Math.floor(Math.random() * 80)

        latency += hopLatency

        const packetDropped = Math.random() < 0.1

        setActiveEdges([edge.id])

        await delay(hopLatency)

        if (packetDropped) {
            setEdgeStatus('failed')

            setLogs((prev) => [
                `[PACKET LOSS] Packet dropped between ${source} → ${target}`,
                ...prev
            ])

            setActiveEdges([])

            return false
        }
    }

    setEdgeStatus('success')

    setActiveEdges([])

    return latency
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}