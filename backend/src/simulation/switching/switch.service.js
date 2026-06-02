const MacEntry = require('../../models/mac_entry.model')
const { Op } = require('sequelize')

async function getMacEntry(networkId, switchId, macAddress) {
    const entry = await MacEntry.findOne({
        where: {
            networkId,
            switchId,
            macAddress,
            expiresAt: {
                [Op.gt]: new Date()
            }
        }
    })
    return entry ? entry.port : null
}

async function saveMacEntry(networkId, switchId, macAddress, port) {
    await MacEntry.upsert({
        networkId,
        switchId,
        macAddress,
        port,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    })
}

async function getAllMacEntries(networkId) {
    const entries = await MacEntry.findAll({
        where: { networkId, expiresAt: { [Op.gt]: new Date() } }
    })
    return entries
}

module.exports = {
    getMacEntry,
    saveMacEntry,
    getAllMacEntries
}
