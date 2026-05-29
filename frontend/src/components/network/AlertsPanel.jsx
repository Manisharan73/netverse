import React from 'react'

export default React.memo(function AlertsPanel({ alerts }) {
    return (
        <div className="alerts-panel">
            <div className="alerts-header">
                Infrastructure Alerts
            </div>

            <div className="alerts-body">
                {
                    alerts.map((alert) => (
                        <div
                            key={alert.id}
                            className={`alert-item ${alert.type}`}
                        >
                            <strong>{alert.type}</strong>
                            <span>{alert.message}</span>
                        </div>
                    ))
                }
            </div>
        </div>
    )
})
