const { DataTypes } = require('sequelize')
const sequelize = require('../database')

const NatSession = sequelize.define('NatSession', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    networkId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    routerId: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Frontend ID of the Router performing PAT'
    },
    privateIp: {
        type: DataTypes.STRING,
        allowNull: false
    },
    privatePort: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    publicIp: {
        type: DataTypes.STRING,
        allowNull: false
    },
    publicPort: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    protocol: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'ICMP'
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: () => new Date(Date.now() + 5 * 60 * 1000) // 5 min timeout
    }
})

module.exports = NatSession
