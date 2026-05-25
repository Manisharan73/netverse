import { useEffect } from 'react'
import useNetworkStore from '../stores/network.store'
import { evaluateNodeMetrics } from '../utils/monitoringEngine'

export default function useMonitoringSimulation({ nodes, setIncidents, setAlerts }) {
    const setNodeMetrics = useNetworkStore((state) => state.setNodeMetrics)

    useEffect(() => {
        const interval = setInterval(() => {
            setNodeMetrics((currentMetrics) => {
                const nextMetrics = { ...currentMetrics }
                let allNewAlerts = []
                let allNewIncidents = []

                nodes.forEach((node) => {
                    const currentMetric = currentMetrics[node.id]
                    
                    const { updatedMetric, newAlerts, newIncidents } = evaluateNodeMetrics(node, currentMetric)
                    
                    if (updatedMetric) {
                        nextMetrics[node.id] = updatedMetric
                    }
                    if (newAlerts && newAlerts.length > 0) {
                        allNewAlerts = [...allNewAlerts, ...newAlerts]
                    }
                    if (newIncidents && newIncidents.length > 0) {
                        allNewIncidents = [...allNewIncidents, ...newIncidents]
                    }
                })

                if (allNewAlerts.length > 0 && setAlerts) {
                    setAlerts(prev => [...allNewAlerts, ...prev].slice(0, 50))
                }

                if (allNewIncidents.length > 0 && setIncidents) {
                    setIncidents(prev => [...allNewIncidents, ...prev].slice(0, 50))
                }

                return nextMetrics
            })

        }, 3000)

        return () => clearInterval(interval)
    }, [nodes, setIncidents, setAlerts, setNodeMetrics])
}
