const { DataTypes } = require('sequelize')
const sequelize = require('../database')

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },

    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },

    password: {
        type: DataTypes.STRING,
        allowNull: false
    },

    role: {
        type: DataTypes.ENUM('USER', 'ADMIN', 'MODERATOR'),
        defaultValue: 'USER'
    },

    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },

    lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true
    },

    displayName: {
        type: DataTypes.STRING,
        allowNull: true
    },

    avatarUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },

    passwordResetToken: {
        type: DataTypes.STRING,
        allowNull: true
    },

    passwordResetExpires: {
        type: DataTypes.DATE,
        allowNull: true
    },

    refreshTokenHash: {
        type: DataTypes.STRING,
        allowNull: true
    }

}, {
    timestamps: true,
    paranoid: true
})

module.exports = User