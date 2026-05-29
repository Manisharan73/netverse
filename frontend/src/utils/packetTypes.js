export const BROADCAST_MAC = 'ff:ff:ff:ff:ff:ff'

export function isBroadcastPacket(packet) {
    return (packet.destinationMac === BROADCAST_MAC)
}

export function isMulticastPacket(packet) {
    return (packet.type === 'MULTICAST')
}