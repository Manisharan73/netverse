const { Server } = require('socket.io')
const { setupTopologyEvents } = require('./topology.events')
const { setupPacketEvents } = require('./packet.events')
const { startMetricsEngine } = require('../simulation/metrics/metrics.engine')

let io;

function initSocketServer(server) {
    io = new Server(server, {
        cors: {
            origin: 'http://localhost:5173',
            methods: ['GET', 'POST']
        }
    })

    io.on('connection', (socket) => {
        console.log('User connected: ', socket.id)

        socket.on('disconnect', () => {
            console.log('User disconnected', socket.id)
        })

        // Join network room based on network ID
        socket.on('network:join', (networkId) => {
            socket.join(`network:${networkId}`)
            console.log(`Socket ${socket.id} joined network ${networkId}`)
        })

        socket.on('network:leave', (networkId) => {
            socket.leave(`network:${networkId}`)
        })

        setupTopologyEvents(socket)
        setupPacketEvents(socket, io)
    })

    // Start Backend Metrics Loop
    startMetricsEngine(io)

    return io
}

function getIo() {
    if (!io) {
        throw new Error('Socket.io not initialized!')
    }
    return io
}

module.exports = {
    initSocketServer,
    getIo
}
