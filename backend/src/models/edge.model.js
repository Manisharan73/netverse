const { DataTypes } = require('sequelize')
const sequelize = require('../database/index')

const Edge = sequelize.define('Edge', {
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
        type: DataTypes.UUID,
        allowNull: false,
        index: true
    },

    targetNodeId: {
        type: DataTypes.UUID,
        allowNull: false,
        index: true
    },

    bandwidth: {
        type: DataTypes.INTEGER,
        defaultValue: 100
    },

    latency: {
        type: DataTypes.INTEGER,
        defaultValue: 10
    },

    packetLoss: {
        type: DataTypes.FLOAT,
        defaultValue: 0.02
    },

    jitter: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },

    status: {
        type: DataTypes.ENUM('ONLINE', 'OFFLINE', 'DEGRADED'),
        defaultValue: 'ONLINE'
    },

    currentLoad: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },

    maxQueueSize: {
        type: DataTypes.INTEGER,
        defaultValue: 1000
    },

    queueDropRate: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0
    },

    isBlocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    stpCost: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },

    label: {
        type: DataTypes.STRING,
        allowNull: true
    },

    color: {
        type: DataTypes.STRING,
        defaultValue: '#4ade80'
    }
})

module.exports = Edge