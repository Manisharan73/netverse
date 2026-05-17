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
    }
})

module.exports = Edge