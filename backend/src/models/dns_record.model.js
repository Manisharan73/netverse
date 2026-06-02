const { DataTypes } = require('sequelize')
const sequelize = require('../database')

const DnsRecord = sequelize.define('DnsRecord', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    networkId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    domain: {
        type: DataTypes.STRING,
        allowNull: false
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: false
    }
})

module.exports = DnsRecord
