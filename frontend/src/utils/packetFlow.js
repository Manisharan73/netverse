import createPacket from './createPacket'
import usePacketStore from '../stores/packet.store'
import { shouldDropPacket } from './qos.utils'
import { BROADCAST_MAC } from './packetTypes'

export function dispatchArpBroadcast({ selectedNode, path, addEvent }) {
    const arpPacket = createPacket({
        sourceId: selectedNode.id,
        targetId: 'broadcast',
        sourceMac: selectedNode.data.mac,
        destinationMac: BROADCAST_MAC,
        vlan: selectedNode.data.vlan,
        path,
        type: 'ARP',
        isBroadcast: true,
        color: '#f59e0b'
    })

    usePacketStore.getState().addPacket(arpPacket)

    addEvent({
        type: 'SWITCH',
        severity: 'INFO',
        message: 'Switch flooding broadcast frame'
    })

    setTimeout(() => {
        usePacketStore.getState().removePacket(arpPacket.id)
    }, 2000)

    return arpPacket
}

export function handlePacketFlow({
    packetType,
    selectedNode,
    targetNode,
    destinationMac,
    path,
    traversedEdges,
    edges,
    addEvent,
    setEdgeStatus,
    setActiveEdges
}) {
    const packet = createPacket({
        sourceId: selectedNode.id,
        targetId: targetNode.id,
        path,
        type: packetType,
        isMulticast: packetType === 'MULTICAST',
        sourceMac: selectedNode.data.mac,
        destinationMac,
        vlan: selectedNode.data.vlan
    })

    usePacketStore.getState().addPacket(packet)

    const packetDropped = traversedEdges.some((edgeId) => {
        const edge = edges.find((e) => e.id === edgeId)
        return shouldDropPacket({ packet, edge })
    })

    if (packetDropped) {
        setEdgeStatus('failed')
        setActiveEdges(traversedEdges)

        addEvent({
            type: 'PING',
            severity: 'ERROR',
            message: 'Packet dropped during transmission'
        })

        setTimeout(() => {
            setActiveEdges([])
        }, 1000)

        return { packet, dropped: true }
    }

    packet.path.forEach((_, index) => {
        if (index === 0) return

        setTimeout(() => {
            usePacketStore.getState().updatePacket(packet.id, (current) => ({
                ...current,
                currentHop: index
            }))
        }, index * 700)
    })

    setTimeout(() => {
        usePacketStore.getState().removePacket(packet.id)
    }, packet.path.length * 700 + 1000)

    return { packet, dropped: false }
}
