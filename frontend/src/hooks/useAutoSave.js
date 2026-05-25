import { useEffect } from 'react'
import { updateNetwork } from '../services/network.service'

export default function useAutoSave({ currentNetworkId, nodes, edges, setSaveStatus }) {
    useEffect(() => {
        if (!currentNetworkId) {
            return
        }

        setSaveStatus('Saving...')

        const timeOut = setTimeout(async () => {
            try {
                await updateNetwork(
                    currentNetworkId,
                    {
                        name: 'My Infrastructure',
                        description: 'NetVerse Topology',
                        nodes,
                        edges
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
