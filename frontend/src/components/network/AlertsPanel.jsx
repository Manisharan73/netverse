import React from 'react'

export default React.memo(function AlertsPanel({ alerts }) {
    return (
        <div className="alerts-panel config-panel styled-scroll">
            <div className="panel-header">
                <h3>Infrastructure Alerts</h3>
                {alerts.length > 0 && <span className="badge badge-danger">{alerts.length}</span>}
            </div>

            <div className="panel-section p-0">
                <div className="alerts-body">
                    {alerts.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">No active alerts</div>
                    ) : (
                        alerts.map((alert) => (
                            <div
                                key={alert.id}
                                className={`alert-item border-b border-gray-800 p-3 flex flex-col gap-1 alert-${(alert.severity || alert.type)?.toLowerCase()}`}
                            >
                                <div className="flex justify-between items-center">
                                    <strong className="text-sm">{alert.type || alert.severity}</strong>
                                </div>
                                <span className="text-sm text-gray-300">{alert.message}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
})
