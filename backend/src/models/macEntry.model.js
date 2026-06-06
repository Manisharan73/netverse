const { DataTypes } = require('sequelize')
const sequelize = require('../database')

const MacEntry = sequelize.define('MacEntry', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    networkId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    switchId: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "The switch ID this MAC table belongs to"
    },
    macAddress: {
        type: DataTypes.STRING,
        allowNull: false
    },
    port: {
        type: DataTypes.STRING, // Edge ID representing the port
        allowNull: false
    },
    vlan: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: () => new Date(Date.now() + 5 * 60 * 1000) // 5 minutes TTL
    }
})

module.exports = MacEntry
