const { DataTypes } = require('sequelize')
const sequelize = require('../database/index')

const Node = sequelize.define('Node', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },

    networkId: {
        type: DataTypes.UUID,
        allowNull: false,
        index: true
    },

    frontendId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    type: {
        type: DataTypes.ENUM('ROUTER', 'SWITCH', 'SERVER', 'HOST'),
        allowNull: false
    },

    label: {
        type: DataTypes.STRING,
        allowNull: false
    },

    ipAddress: {
        type: DataTypes.STRING,
        allowNull: true
    },

    subnetMask: {
        type: DataTypes.STRING,
        allowNull: true
    },

    macAddress: {
        type: DataTypes.STRING,
        allowNull: true
    },

    gateway: {
        type: DataTypes.STRING,
        allowNull: true
    },

    status: {
        type: DataTypes.ENUM('ONLINE', 'OFFLINE', 'DEGRADED'),
        defaultValue: 'ONLINE'
    },

    cpuLoad: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },

    memoryUsage: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },

    uptime: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },

    posX: {
        type: DataTypes.FLOAT
    },

    posY: {
        type: DataTypes.FLOAT
    },

    role: {
        type: DataTypes.ENUM('EDGE', 'CORE', 'DISTRIBUTION', 'ACCESS'),
        defaultValue: 'ACCESS'
    },

    isGateway: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    isDHCPEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    isNATEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    routingTable: {
        type: DataTypes.JSON,
        allowNull: true
    },

    arpTable: {
        type: DataTypes.JSON,
        allowNull: true
    },

    macTable: {
        type: DataTypes.JSON,
        allowNull: true
    },

    firewallRules: {
        type: DataTypes.JSON,
        allowNull: true
    },

    containerId: {
        type: DataTypes.STRING,
        allowNull: true
    },

    containerStatus: {
        type: DataTypes.ENUM('NOT_CREATED', 'RUNNING', 'STOPPED'),
        defaultValue: 'NOT_CREATED'
    }

})

module.exports = Node