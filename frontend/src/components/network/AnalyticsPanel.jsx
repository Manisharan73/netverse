import useNetworkStore from '../../stores/network.store'

export default function AnalyticsPanel({ nodes }) {
    const nodeMetrics = useNetworkStore((state) => state.nodeMetrics)

    return (
        <div className="analytics-grid">
            {
                nodes.map((node) => {
                    const metric = nodeMetrics[node.id] || {}
                    return (
                        <div
                            key={node.id}
                            className='analytics-card'
                        >
                            <h4>{node.data.label}</h4>

                            <p>
                                Traffic:
                                {metric.traffic || 0}
                            </p>

                            <p>
                                Sent:
                                {metric.packetsSent || 0}
                            </p>

                            <p>
                                Received:
                                {metric.packetsReceived || 0}
                            </p>
                        </div>
                    )
                })
            }
        </div>
    )
}
