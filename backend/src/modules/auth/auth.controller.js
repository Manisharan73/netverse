const {
    registerUser,
    loginUser
} = require('./auth.service')

const handleError = require('../../utils/handleError')

async function register(req, res) {
    try {
        const user = await registerUser(req.body)

        return res.status(201).json({
            message: "User registered successfully",
            user
        })

    } catch (err) {
        return handleError(res, err)
    }
}

async function login(req, res) {
    try {
        const result = await loginUser(req.body)

        return res.status(200).json(result)

    } catch (err) {
        return handleError(res, err)
    }
}

module.exports = {
    register,
    login
}