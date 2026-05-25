import {
    STATUS,
    SERVICE_STATUS,
    CPU_WARNING,
    CPU_CRITICAL,
    RAM_WARNING,
    SERVICE_CPU_CRITICAL,
    SERVICE_MEMORY_WARNING
} from '../constants/monitoring.constants'

import { serviceDependencies } from './serviceDependencies'

function applyDependencies(services) {
    const serviceMap = {}
    services.forEach(s => serviceMap[s.name] = s)

    services.forEach((service) => {
        const dependencies = serviceDependencies[service.name] || []

        for(const dependencyName of dependencies) {
            const dependency = serviceMap[dependencyName]

            if(dependency && dependency.status === SERVICE_STATUS.FAILED) {
                if (service.status !== SERVICE_STATUS.FAILED) {
                    service.status = SERVICE_STATUS.WARNING
                }
            }
        }
    })
}

export function evaluateNodeMetrics(node, currentMetric) {
    if (node.type !== 'serverNode') {
        return { updatedMetric: null, newAlerts: [], newIncidents: [] }
    }

    let cpu = Math.floor(Math.random() * 100)
    let ram = Math.floor(Math.random() * 100)
    let storage = Math.floor(Math.random() * 100)

    let status = STATUS.ONLINE
    const newAlerts = []
    const newIncidents = []
    const timestamp = new Date().toLocaleTimeString()

    if (cpu > CPU_WARNING || ram > RAM_WARNING) {
        status = STATUS.WARNING
        newAlerts.push({
            id: Date.now() + Math.random(),
            message: `High resource usage on ${node.data.label}`,
            time: timestamp,
            type: 'warning'
        })
    }

    if (cpu > CPU_CRITICAL) {
        status = STATUS.OFFLINE
        newIncidents.push({
            id: Date.now() + Math.random(),
            message: `Server ${node.data.label} went offline due to critical CPU!`,
            time: timestamp,
            severity: 'critical'
        })
    }

    const currentServices = currentMetric?.services || node.data?.services || []

    const updatedServices = currentServices.map((service) => {
        let serviceStatus = SERVICE_STATUS.RUNNING

        const serviceCpu = Math.floor(Math.random() * 100)
        const serviceMemory = Math.floor(Math.random() * 100)

        if (serviceCpu > SERVICE_CPU_CRITICAL) {
            serviceStatus = SERVICE_STATUS.FAILED
        } else if (serviceMemory > SERVICE_MEMORY_WARNING) {
            serviceStatus = SERVICE_STATUS.WARNING
        }

        // If restarting, keep it restarting (simulated delay)
        if (service.status === SERVICE_STATUS.RESTARTING) {
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

    const failedServices = updatedServices.filter(
        (service) => service.status === SERVICE_STATUS.FAILED
    )

    if (failedServices.length > 0 && status !== STATUS.OFFLINE) {
        status = STATUS.WARNING
    }

    const updatedMetric = {
        ...currentMetric,
        cpu: `${cpu}%`,
        ram: `${ram}%`,
        storage: `${storage}%`,
        status,
        services: updatedServices
    }

    return { updatedMetric, newAlerts, newIncidents }
}