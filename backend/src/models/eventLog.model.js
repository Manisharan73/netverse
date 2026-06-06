const { DataTypes } = require('sequelize')
const sequelize = require('../database')

const EventLog = sequelize.define('EventLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },

    networkId: {
        type: DataTypes.UUID,
        allowNull: false
    },

    nodeId: {
        type: DataTypes.UUID,
        allowNull: true
    },

    type: {
        type: DataTypes.STRING,
        allowNull: false
    },

    severity: {
        type: DataTypes.STRING,
        allowNull: false
    },

    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    metadata: {
        type: DataTypes.JSON,
        allowNull: true
    }
})

module.exports = EventLog