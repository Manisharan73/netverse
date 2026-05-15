const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../users/user.model')
require('dotenv').config()

const { validateRegister, validateLogin } = require('./auth.validation')

async function registerUser(data) {
    validateRegister(data)

    const { username, email, password } = data

    const existingUser = await User.findOne({
        where: {email}
    })

    if(existingUser) {
        throw new Error('User already exists!')
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const safeUser = await User.create({
        id: user.id,
        username,
        email,
    })

    return safeUser
}

async function loginUser(data) {
    validateLogin(data)

    const { email, password } = data

    const user = await User.findOne({
        where: {
            email
        }
    })

    if(!user) {
        throw new Error('Invalid credentials!')
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if(!isPasswordValid) {
        throw new Error('Invalid credentials!')
    }

    const token = jwt.sign(
        {
            id: user.id,
            email: user.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '7d'
        }
    )

    return {
        token,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt
        }
    }
}

module.exports = {
    registerUser,
    loginUser
}