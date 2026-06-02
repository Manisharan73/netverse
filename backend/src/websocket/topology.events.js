function setupTopologyEvents(socket) {
    socket.on('node:add', (node) => {
        socket.broadcast.emit('node:added', node)
    })

    socket.on('node:move', (data) => {
        socket.broadcast.emit('node:moved', data)
    })

    socket.on('edge:add', (edge) => {
        socket.broadcast.emit('edge:added', edge)
    })

    socket.on('node:delete', (data) => {
        socket.broadcast.emit('node:deleted', data)
    })

    socket.on('node:updateLabel', (data) => {
        socket.broadcast.emit('node:labelUpdated', data)
    })

    socket.on('service:action', async (data) => {
        const Node = require('../models/node.model')
        try {
            const { networkId, nodeId, serviceId, action } = data
            const node = await Node.findOne({ where: { networkId, frontendId: nodeId } })
            
            if (node && node.data && node.data.services) {
                const services = node.data.services
                const serviceIndex = services.findIndex(s => s.id === serviceId)
                
                if (serviceIndex !== -1) {
                    if (action === 'start') services[serviceIndex].status = 'RUNNING'
                    if (action === 'stop') services[serviceIndex].status = 'STOPPED'
                    if (action === 'restart') services[serviceIndex].status = 'RESTARTING'
                    
                    node.changed('data', true)
                    await node.save()

                    socket.to(`network:${networkId}`).emit('node:updated', {
                        id: nodeId,
                        data: node.data
                    })
                }
            }
        } catch (err) {
            console.error('Service action error:', err)
        }
    })
}

module.exports = {
    setupTopologyEvents
}
