const EventLog = require('../../models/event_log.model')

async function logEvent({ networkId, type, severity, message, io }) {
    try {
        const log = await EventLog.create({
            networkId,
            type,
            severity,
            message
        })

        if (io) {
            io.to(`network:${networkId}`).emit('event:created', {
                id: log.id,
                type: log.type,
                severity: log.severity,
                message: log.message,
                time: log.createdAt.toLocaleTimeString()
            })
        }
    } catch (err) {
        console.error('Error logging event:', err)
    }
}

module.exports = {
    logEvent
}
