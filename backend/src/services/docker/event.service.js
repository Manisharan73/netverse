const EventLog = require('../../models/event_log.model');

async function logContainerEvent(networkId, nodeId, eventType, message, severity, metadata = {}) {
    try {
        await EventLog.create({
            networkId,
            nodeId,
            type: eventType,
            severity,
            message,
            metadata
        })
    } catch (err) {
        console.error(`Failed to log container event ${eventType} for node ${nodeId}:`, err)
    }
}

function logContainerCreated(networkId, nodeId, metadata) {
    return logContainerEvent(networkId, nodeId, 'CONTAINER_CREATED', `Container created for node ${nodeId}`, 'info', metadata)
}

function logContainerStarted(networkId, nodeId, metadata) {
    return logContainerEvent(networkId, nodeId, 'CONTAINER_STARTED', `Container started for node ${nodeId}`, 'info', metadata)
}

function logContainerStopped(networkId, nodeId, metadata) {
    return logContainerEvent(networkId, nodeId, 'CONTAINER_STOPPED', `Container stopped for node ${nodeId}`, 'info', metadata)
}

function logContainerRestarted(networkId, nodeId, metadata) {
    return logContainerEvent(networkId, nodeId, 'CONTAINER_RESTARTED', `Container restarted for node ${nodeId}`, 'info', metadata)
}

function logContainerDeleted(networkId, nodeId, metadata) {
    return logContainerEvent(networkId, nodeId, 'CONTAINER_DELETED', `Container deleted for node ${nodeId}`, 'warning', metadata)
}

function logContainerCrashed(networkId, nodeId, metadata) {
    return logContainerEvent(networkId, nodeId, 'CONTAINER_CRASHED', `Container crashed for node ${nodeId}`, 'critical', metadata)
}

module.exports = {
    logContainerCreated,
    logContainerStarted,
    logContainerStopped,
    logContainerRestarted,
    logContainerDeleted,
    logContainerCrashed
}