const { DataTypes } = require('sequelize')
const sequelize = require('../database/index')

const Network = sequelize.define('Network', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },

    name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        index: true
    },

    status: {
        type: DataTypes.ENUM('ACTIVE', 'PAUSED', 'ARCHIVED'),
        defaultValue: 'ACTIVE'
    },

    isSimulating: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    tickRate: {
        type: DataTypes.INTEGER,
        defaultValue: 1000 
    },

    timeScale: {
        type: DataTypes.FLOAT,
        defaultValue: 1.0 
    },

    nodeCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },

    edgeCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },

    version: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },

    lastSnapshotAt: {
        type: DataTypes.DATE,
        allowNull: true
    },

    isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    maxUsers: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },

    activeUsers: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },

    packetCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },

    droppedPackets: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },

    totalLatency: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },

    stateSnapshot: {
        type: DataTypes.JSON,
        allowNull: true
    },

    simulation: {
        type: DataTypes.JSON,
        allowNull: true
    },

    deletedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }

}, {
    paranoid: true
})

module.exports = Network