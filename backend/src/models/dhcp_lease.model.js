const { DataTypes } = require('sequelize')
const sequelize = require('../database')

const DhcpLease = sequelize.define('DhcpLease', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    networkId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    macAddress: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: 'mac_network_unique' // A MAC gets one lease per network
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: 'ip_network_unique' // An IP can only be leased once per network
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours TTL
    }
})

module.exports = DhcpLease
