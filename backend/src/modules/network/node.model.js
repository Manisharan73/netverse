const { DataTypes } = require('sequelize')
const sequelize = require('../../database/index')

const Node = sequelize.define('Node', {
    type: {
        type: DataTypes.STRING,
        allowNull: false
    },

    label: {
        type: DataTypes.STRING,
        allowNull: false
    },

    ipAddress: {
        type: DataTypes.STRING
    },

    posX: {
        type: DataTypes.FLOAT
    },

    posY: {
        type: DataTypes.FLOAT
    },

    status: {
        type: DataTypes.STRING,
        defaultValue: 'ONLINE'
    }
})

module.exports = Node