const jwt = require('jsonwebtoken')

function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                error: 'No token provided'
            })
        }

        const token = authHeader.split(" ")[1]

        if (!token) {
            return res.status(401).json({
                error: "Token missing or malformed",
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = decoded

        next()
    } catch (err) {
        return handleAuthError(res, err)
    }
}

function handleAuthError(res, err) {
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: 'Token expired'
        })
    }

    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: 'Invalid token'
        })
    }

    return res.status(401).json({
        error: 'Unauthorized access'
    })
}

module.exports = authMiddleware