const { getIo } = require('./socket.server')

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

module.exports = {
    broadcastNodeMetrics,
    broadcastNetworkMetrics
}