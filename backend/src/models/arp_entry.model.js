const { DataTypes } = require('sequelize')
const sequelize = require('../database')

const ArpEntry = sequelize.define('ArpEntry', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    networkId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    sourceNodeId: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "The node ID this ARP table belongs to"
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: false
    },
    macAddress: {
        type: DataTypes.STRING,
        allowNull: false
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: () => new Date(Date.now() + 5 * 60 * 1000) // 5 minutes TTL
    }
})

module.exports = ArpEntry
