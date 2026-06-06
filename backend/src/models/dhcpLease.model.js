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
        unique: 'mac_network_unique'
    },

    ipAddress: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: 'ip_network_unique'
    },

    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: () => new Date(Date.now() + 24 * 60 * 60 * 1000) 
    }
})

module.exports = DhcpLease