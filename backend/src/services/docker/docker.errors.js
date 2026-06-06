class DockerUnavailableError extends Error {
    constructor(message = 'Docker daemon is unavailable or not running.') {
        super(message)
        this.name = 'DockerUnavailableError'
        this.status = 503
    }
}

class ContainerNotFoundError extends Error {
    constructor(containerId) {
        super(`Container ${containerId} not found.`)
        this.name = 'ContainerNotFoundError'
        this.status = 404
    }
}

class ContainerAlreadyRunningError extends Error {
    constructor(containerId) {
        super(`Container ${containerId} is already running.`)
        this.name = 'ContainerAlreadyRunningError'
        this.status = 409
    }
}

class ContainerAlreadyStoppedError extends Error {
    constructor(containerId) {
        super(`Container ${containerId} is already stopped.`)
        this.name = 'ContainerAlreadyStoppedError'
        this.status = 409
    }
}

module.exports = {
    DockerUnavailableError,
    ContainerNotFoundError,
    ContainerAlreadyRunningError,
    ContainerAlreadyStoppedError
}