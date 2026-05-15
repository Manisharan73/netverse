const {
    registerUser,
    loginUser
} = require('./auth.service')

async function register(req, res) {
    try {
        const user = await register(req.body)

        res.status(201).json({
            message: "User registered successfully!",
            user
        })
    } catch(err) {
        res.status(400).json({
            error: err.message
        })
    }
}

async function login(req, res) {
    try {
        const result = await loginUser(req.body)

        res.json(result)
    } catch(err) {
        res.status(400).json({
            error: err.message
        })
    }
}

module.exports = {
    register,
    login
}