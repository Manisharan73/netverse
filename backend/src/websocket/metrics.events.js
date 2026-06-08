const { getIo } = require('./socket.server')

function emitMetricsUpdate(payload) {
    try {
        const io = getIo()
        io.to(`network:${payload.networkId}`).emit('metrics:update', payload)
    } catch (err) {
        console.error('Failed to emit metrics update:', err.message)
    }
}

function broadcastNodeMetrics(networkId, payload) {
    try {
        const io = getIo()
        io.to(`network:${networkId}`).emit('node:metrics', payload)
    } catch (err) {
        console.error('Failed to broadcast node metrics:', err.message)
    }
}

function broadcastNetworkMetrics(networkId, payload) {
    try {
        const io = getIo()
        io.to(`network:${networkId}`).emit('network:metrics', payload)
    } catch (err) {
        console.error('Failed to broadcast network metrics:', err.message)
    }
}

function emitNodeOnline(networkId, nodeId) {
    try {
        const io = getIo()
        io.to(`network:${networkId}`).emit('node:online', { nodeId, networkId })
    } catch (err) {
        console.error('Failed to emit node online:', err.message)
    }
}

function emitNodeOffline(networkId, nodeId) {
    try {
        const io = getIo()
        io.to(`network:${networkId}`).emit('node:offline', { nodeId, networkId })
    } catch (err) {
        console.error('Failed to emit node offline:', err.message)
    }
}

module.exports = {
    emitMetricsUpdate,
    broadcastNodeMetrics,
    broadcastNetworkMetrics,
    emitNodeOnline,
    emitNodeOffline
}