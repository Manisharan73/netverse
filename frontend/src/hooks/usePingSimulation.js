import socket from '../websocket/socket'
import useNetworkStore from '../stores/network.store'
import useEventStore from '../stores/event.store'
import { isValidIp } from '../utils/network.utils'

export default function usePingSimulation({ nodes, selectedNode, pingTarget }) {
    const addEvent = useEventStore((state) => state.addEvent)

    async function pingNode(packetType = 'ICMP') {
        if (!selectedNode || !pingTarget) return

        let finalIp = pingTarget

        const currentNetwork = useNetworkStore.getState().currentNetwork
        if (!currentNetwork) {
            addEvent({ type: 'NETWORK', severity: 'ERROR', message: 'No network loaded' })
            return
        }

        addEvent({
            type: 'PING',
            severity: 'INFO',
            message: `Pinging ${finalIp} with 32 bytes of data`
        })

        socket.emit('ping:start', {
            networkId: currentNetwork.id,
            sourceNodeId: selectedNode.id.toString(),
            destinationIp: finalIp,
            type: packetType
        })
    }

    return { pingNode }
}
