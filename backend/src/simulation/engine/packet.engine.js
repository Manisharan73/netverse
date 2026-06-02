const crypto = require('crypto')

function createPacket(options) {
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

        ttl: 64,

        createdAt: Date.now(),

        isBroadcast: options.isBroadcast || false,
        isMulticast: options.isMulticast || false,
    }
}

module.exports = {
    createPacket
}
