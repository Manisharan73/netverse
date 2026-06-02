const ArpEntry = require('../../models/arp_entry.model')
const { Op } = require('sequelize')

async function getArpEntry(networkId, sourceNodeId, ipAddress) {
    const entry = await ArpEntry.findOne({
        where: {
            networkId,
            sourceNodeId,
            ipAddress,
            expiresAt: {
                [Op.gt]: new Date()
            }
        }
    })
    return entry ? entry.macAddress : null
}

async function saveArpEntry(networkId, sourceNodeId, ipAddress, macAddress) {
    await ArpEntry.upsert({
        networkId,
        sourceNodeId,
        ipAddress,
        macAddress,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    })
}

async function getAllArpEntries(networkId) {
    const entries = await ArpEntry.findAll({
        where: { networkId, expiresAt: { [Op.gt]: new Date() } }
    })
    return entries
}

module.exports = {
    getArpEntry,
    saveArpEntry,
    getAllArpEntries
}
