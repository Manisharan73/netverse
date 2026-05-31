import React from 'react'
import useNetworkStore from '../../stores/network.store'

export default React.memo(function AnalyticsPanel({ nodes }) {
    const nodeMetrics = useNetworkStore((state) => state.nodeMetrics)

    return (
        <div className="analytics-panel config-panel styled-scroll">
            <div className="panel-header">
                <h3>Network Analytics</h3>
                <span className="badge">{nodes.length} Nodes</span>
            </div>
            <div className="panel-section p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                    {nodes.length === 0 ? (
                        <div className="col-span-full p-4 text-center text-gray-500 text-sm">No nodes to display</div>
                    ) : (
                        nodes.map((node) => {
                            const metric = nodeMetrics[node.id] || {}
                            return (
                                <div key={node.id} className="analytics-card bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col gap-2 shadow-sm hover:border-blue-500 transition-colors">
                                    <h4 className="font-semibold text-gray-200 border-b border-gray-700 pb-2 mb-2">{node.data.label}</h4>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 text-sm">Traffic</span>
                                        <strong className="font-mono text-blue-400">{metric.traffic || 0}</strong>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 text-sm">Sent</span>
                                        <strong className="font-mono text-green-400">{metric.packetsSent || 0}</strong>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 text-sm">Received</span>
                                        <strong className="font-mono text-purple-400">{metric.packetsReceived || 0}</strong>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
})