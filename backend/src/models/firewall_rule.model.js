const { DataTypes } = require('sequelize')
const sequelize = require('../database')

const FirewallRule = sequelize.define('FirewallRule', {
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
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Frontend ID of the Router this rule applies to'
    },
    action: {
        type: DataTypes.ENUM('ALLOW', 'DENY'),
        allowNull: false,
        defaultValue: 'DENY'
    },
    protocol: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'ANY'
    },
    sourceIp: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'ANY'
    },
    targetIp: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'ANY'
    }
})

module.exports = FirewallRule
