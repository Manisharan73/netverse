import React from 'react'

const NetworkStats = React.memo(function NetworkStats({
    routerCount,
    serverCount,
    connectionCount,
    onlineCount,
    offlineCount,
    warningCount,
    healthScore
}) {
    return (
        <div className="stats-grid">
            <div className="stat-card">
                <h3>{routerCount}</h3>
                <p>Routers</p>
            </div>

            <div className="stat-card">
                <h3>{serverCount}</h3>
                <p>Servers</p>
            </div>

            <div className="stat-card">
                <h3>{connectionCount}</h3>
                <p>Connections</p>
            </div>

            <div className="stat-card">
                <h3>{onlineCount}</h3>
                <p>Online</p>
            </div>

            <div className="stat-card">
                <h3>{offlineCount}</h3>
                <p>Offline</p>
            </div>

            <div className="stat-card">
                <h3>{warningCount}</h3>
                <p>Warning</p>
            </div>

            <div className="stat-card">
                <h3>{healthScore}</h3>
                <p>Network Health</p>
            </div>
        </div>
    )
})

export default NetworkStats
