const Network = require('../../models/network.model')
const Node = require('../../models/node.model')
const Edge = require('../../models/edge.model')
const { serviceDependencies } = require('./serviceDependencies')

const STATUS = {
    ONLINE: 'ONLINE',
    WARNING: 'WARNING',
    OFFLINE: 'OFFLINE'
}

const SERVICE_STATUS = {
    RUNNING: 'RUNNING',
    WARNING: 'WARNING',
    FAILED: 'FAILED',
    STOPPED: 'STOPPED',
    RESTARTING: 'RESTARTING'
}

const CPU_WARNING = 80
const CPU_CRITICAL = 95
const RAM_WARNING = 85
const SERVICE_CPU_CRITICAL = 90
const SERVICE_MEMORY_WARNING = 85

function applyDependencies(services) {
    const serviceMap = {}
    services.forEach(s => serviceMap[s.name] = s)

    services.forEach((service) => {
        const dependencies = serviceDependencies[service.name] || []

        for(const dependencyName of dependencies) {
            const dependency = serviceMap[dependencyName]

            if(dependency && dependency.status === SERVICE_STATUS.FAILED) {
                if (service.status !== SERVICE_STATUS.FAILED && service.status !== SERVICE_STATUS.STOPPED) {
                    service.status = SERVICE_STATUS.WARNING
                }
            }
        }
    })
}

async function evaluateNetworkMetrics(networkId, io) {
    try {
        const nodes = await Node.findAll({ where: { networkId } })
        
        const updatedMetrics = {}
        const newAlerts = []
        const newIncidents = []

        nodes.forEach(node => {
            if (node.type !== 'serverNode' && node.type !== 'routerNode') return

            let cpu = Math.floor(Math.random() * 100)
            let ram = Math.floor(Math.random() * 100)
            let storage = Math.floor(Math.random() * 100)
            
            let status = STATUS.ONLINE
            const timestamp = new Date().toLocaleTimeString()

            if (cpu > CPU_WARNING || ram > RAM_WARNING) {
                status = STATUS.WARNING
                newAlerts.push({
                    id: Date.now() + Math.random(),
                    message: `High resource usage on ${node.label}`,
                    time: timestamp,
                    type: 'warning'
                })
            }

            if (cpu > CPU_CRITICAL) {
                status = STATUS.OFFLINE
                newIncidents.push({
                    id: Date.now() + Math.random(),
                    message: `Server ${node.label} went offline due to critical CPU!`,
                    time: timestamp,
                    severity: 'critical'
                })
            }

            // Evaluate services if server
            let updatedServices = []
            if (node.type === 'serverNode') {
                const currentServices = node.data?.services || []

                updatedServices = currentServices.map((service) => {
                    let serviceStatus = SERVICE_STATUS.RUNNING
                    const serviceCpu = Math.floor(Math.random() * 100)
                    const serviceMemory = Math.floor(Math.random() * 100)

                    if (serviceCpu > SERVICE_CPU_CRITICAL) {
                        serviceStatus = SERVICE_STATUS.FAILED
                    } else if (serviceMemory > SERVICE_MEMORY_WARNING) {
                        serviceStatus = SERVICE_STATUS.WARNING
                    }

                    if (service.status === SERVICE_STATUS.STOPPED) {
                        serviceStatus = SERVICE_STATUS.STOPPED
                    } else if (service.status === SERVICE_STATUS.RESTARTING) {
                        serviceStatus = SERVICE_STATUS.RESTARTING
                    }

                    return {
                        ...service,
                        cpu: serviceCpu,
                        memory: serviceMemory,
                        status: serviceStatus
                    }
                })

                applyDependencies(updatedServices)

                const failedServices = updatedServices.filter(s => s.status === SERVICE_STATUS.FAILED)
                if (failedServices.length > 0 && status !== STATUS.OFFLINE) {
                    status = STATUS.WARNING
                }
            }

            updatedMetrics[node.frontendId] = {
                cpu: `${cpu}%`,
                ram: `${ram}%`,
                storage: `${storage}%`,
                status,
                services: updatedServices
            }
        })

        if (Object.keys(updatedMetrics).length > 0) {
            io.to(`network:${networkId}`).emit('metrics:updated', updatedMetrics)
        }
        
        if (newAlerts.length > 0) {
            io.to(`network:${networkId}`).emit('alerts:created', newAlerts)
        }

        if (newIncidents.length > 0) {
            io.to(`network:${networkId}`).emit('incidents:created', newIncidents)
        }

    } catch (err) {
        console.error('Error evaluating metrics:', err)
    }
}

function startMetricsEngine(io) {
    setInterval(() => {
        // Find all active networks by scanning socket io rooms
        const rooms = io.sockets.adapter.rooms
        const activeNetworks = []
        
        for (const [room, _] of rooms.entries()) {
            if (room.startsWith('network:')) {
                activeNetworks.push(room.replace('network:', ''))
            }
        }

        activeNetworks.forEach(networkId => {
            evaluateNetworkMetrics(networkId, io)
        })
    }, 3000)
}

module.exports = {
    startMetricsEngine
}
