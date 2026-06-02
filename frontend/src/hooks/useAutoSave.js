import { useEffect } from 'react'
import { updateNetwork } from '../services/network.service'
import { exportSimulationState } from '../utils/networkSerializer'
import useNetworkStore from '../stores/network.store'

export default function useAutoSave({ currentNetworkId, nodes, edges, setSaveStatus }) {
    useEffect(() => {
        if (!currentNetworkId) {
            return
        }

        setSaveStatus('Saving...')

        const timeOut = setTimeout(async () => {
            try {
                const currentNetwork = useNetworkStore.getState().currentNetwork
                const metricsMap = useNetworkStore.getState().nodeMetrics

                const payloadNodes = nodes.map(node => ({
                    ...node,
                    metrics: metricsMap[node.id] || null
                }))

                await updateNetwork(
                    currentNetworkId,
                    {
                        name: currentNetwork?.name || 'Untitled Network',
                        description: currentNetwork?.description || '',
                        nodes: payloadNodes,
                        edges,
                        simulation: exportSimulationState()
                    }
                )

                setSaveStatus('Saved')
            } catch (err) {
                console.error(err)
                setSaveStatus('Error')
            }
        }, 1500)

        return () => clearTimeout(timeOut)
    }, [currentNetworkId, nodes, edges, setSaveStatus])
}
