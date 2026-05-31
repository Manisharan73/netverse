const { DataTypes } = require('sequelize')
const sequelize = require('../database/index')

const Network = sequelize.define('Network', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    description: {
        type: DataTypes.TEXT
    }
})

module.exports = Network