import { PROTOCOL_PROFILES } from '../constants/protocolConfig'

export default function createPacket({ sourceId, targetId, path, type, vlan }) {
    const profile = PROTOCOL_PROFILES[type]

    return {
        id: crypto.randomUUID(),

        sourceId,
        targetId,

        path,

        type,
        vlan: vlan || 1,

        color: profile.color,

        ttl: profile.ttl,

        createdAt: Date.now(),

        profile,

        isBroadcast: options.isBroadcast || false,
        isMulticast: options.isMulticast || false,
    }
}