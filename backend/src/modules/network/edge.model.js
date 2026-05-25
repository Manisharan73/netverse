const { DataTypes } = require('sequelize')
const sequelize = require('../../database/index')

const Edge = sequelize.define('Edge', {
    sourceNodeId: {
        type: DataTypes.STRING,
        allowNull: false
    },

    targetNodeId: {
        type: DataTypes.STRING,
        allowNull: false
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

    status: {
        type: DataTypes.STRING,
        defaultValue: 'ONLINE'
    },

    traffic: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
})

module.exports = Edge