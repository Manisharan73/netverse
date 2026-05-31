import { PROTOCOL_PROFILES } from '../constants/protocolConfig'

export default function createPacket(options) {
    const { 
        sourceId, 
        targetId, 
        type, 
        vlan, 
        sourceIp, 
        destinationIp, 
        sourceMac, 
        destinationMac 
    } = options

    const profile = PROTOCOL_PROFILES[type] || { color: '#ccc', ttl: 64 }

    return {
        id: crypto.randomUUID(),

        sourceId,
        targetId,

        currentLocation: sourceId,
        previousLocation: null,
        nextLocation: null,
        
        sourceIp,
        destinationIp,
        sourceMac,
        destinationMac,

        type,
        vlan: vlan || 1,

        color: options.color || profile.color,

        ttl: profile.ttl || 64,

        createdAt: Date.now(),

        profile,

        isBroadcast: options.isBroadcast || false,
        isMulticast: options.isMulticast || false,
    }
}