import React from 'react'

export default React.memo(function RoutingPanel({ routingTable }) {
    return (
        <div className="routing-panel config-panel styled-scroll">
            <div className="panel-header">
                <h3>Routing Table</h3>
                <span className="badge">{routingTable.length} Routes</span>
            </div>

            <div className="panel-section p-0">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase">
                            <th className="p-2 font-semibold">Node</th>
                            <th className="p-2 font-semibold">Destination</th>
                            <th className="p-2 font-semibold">Gateway</th>
                            <th className="p-2 font-semibold">Status</th>
                        </tr>
                    </thead>
                    <tbody className="font-mono text-sm">
                        {routingTable.map((route, index) => (
                            <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="p-2">{route.node}</td>
                                <td className="p-2">{route.ip}{route.subnet ? `/${route.subnet}` : ''}</td>
                                <td className="p-2">{route.gateway || '-'}</td>
                                <td className="p-2">
                                    <span className={`status-badge ${route.status?.toLowerCase() || 'online'}`}>
                                        {route.status || 'ONLINE'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {routingTable.length === 0 && (
                    <div className="p-4 text-center text-gray-500 text-sm">No routes established</div>
                )}
            </div>
        </div>
    )
})