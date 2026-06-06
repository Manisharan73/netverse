const docker = require("./docker.client")
const {
    DockerUnavailableError,
    ContainerNotFoundError,
    ContainerAlreadyRunningError,
    ContainerAlreadyStoppedError
} = require("./docker.errors")
const templateFactory = require('./templates/template.factory')

function handleDockerError(err, containerId = null) {
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOENT') {
        throw new DockerUnavailableError()
    }

    if (err.statusCode === 404) {
        throw new ContainerNotFoundError(containerId)
    }

    if (err.statusCode === 304 && err.message && err.message.includes('already started')) {
        throw new ContainerAlreadyRunningError(containerId)
    }

    if (err.statusCode === 304 && err.message && err.message.includes('already stopped')) {
        throw new ContainerAlreadyStoppedError(containerId)
    }
    
    throw err
}

async function getDockerInfo() {
    try {
        return await docker.info()
    } catch (err) {
        handleDockerError(err)
    }
}

async function listContainers(all = true) {
    try {
        return await docker.listContainers({ all })
    } catch (err) {
        handleDockerError(err)
    }
}

async function pingDocker() {
    try {
        return await docker.ping()
    } catch (err) {
        handleDockerError(err)
    }
}

async function ensureImageExists(image) {
    try {
        const images = await docker.listImages({ filters: { reference: [image] } })

        if (images.length === 0) {
            console.log(`Pulling image ${image}...`)

            await new Promise((resolve, reject) => {
                docker.pull(image, (err, stream) => {
                    if (err) {
                        return reject(err)
                    }

                    docker.modem.followProgress(stream, onFinished)

                    function onFinished(err, output) {
                        if (err) {
                            return reject(err)
                        }

                        resolve(output)
                    }
                })
            })

            console.log(`Pulled image ${image} successfully.`)
        }
    } catch (err) {
        handleDockerError(err)
    }
}

async function createContainer(node) {
    try {
        const config = templateFactory.getTemplate(node)
        await ensureImageExists(config.Image)

        const container = await docker.createContainer(config)
        return await container.inspect()
    } catch (err) {
        handleDockerError(err)
    }
}

async function startContainer(containerId) {
    try {
        const container = docker.getContainer(containerId)
        await container.start()
        return await container.inspect()
    } catch (err) {
        handleDockerError(err, containerId)
    }
}

async function stopContainer(containerId) {
    try {
        const container = docker.getContainer(containerId)
        await container.stop()
        return await container.inspect()
    } catch (err) {
        handleDockerError(err, containerId)
    }
}

async function restartContainer(containerId) {
    try {
        const container = docker.getContainer(containerId)
        await container.restart()
        return await container.inspect()
    } catch (err) {
        handleDockerError(err, containerId)
    }
}

async function removeContainer(containerId) {
    try {
        const container = docker.getContainer(containerId)
        await container.remove({ force: true })
        return true
    } catch (err) {
        handleDockerError(err, containerId)
    }
}

async function inspectContainer(containerId) {
    try {
        const container = docker.getContainer(containerId)
        return await container.inspect()
    } catch (err) {
        handleDockerError(err, containerId)
    }
}

module.exports = {
    getDockerInfo,
    listContainers,
    pingDocker,
    createContainer,
    startContainer,
    stopContainer,
    restartContainer,
    removeContainer,
    inspectContainer
}