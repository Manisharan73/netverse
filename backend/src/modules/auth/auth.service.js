const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../../models/user.model')
const { Op } = require('sequelize')
require('dotenv').config()

const { validateRegister, validateLogin } = require('../../validation/auth.schema')

const SALT_ROUNDS = 12

async function registerUser(data) {
    validateRegister(data)

    const { username, email, password } = data

    const existingUser = await User.findOne({
        where: {
            [Op.or]: [{ email }, { username }]
        }
    })

    if (existingUser) {
        throw new Error('User already exists!')
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    const safeUser = await User.create({
        username,
        email,
        password: hashedPassword
    })

    return sanitizeUser(safeUser)
}

async function loginUser(data) {
    validateLogin(data)

    const { identifier, password } = data

    const user = await User.findOne({
        where: {
            [Op.or]: [
                { email: identifier },
                { username: identifier }
            ]
        }
    })

    if (!user) {
        throw new Error('Invalid credentials!')
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
        throw new Error('Invalid credentials!')
    }

    const token = jwt.sign(
        {
            id: user.id,
            role: user.role || 'USER',
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '7d'
        }
    )

    return {
        token,
        user: sanitizeUser(user)
    }
}

function sanitizeUser(user) {
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
    }
}

module.exports = {
    registerUser,
    loginUser
}