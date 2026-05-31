function handleError(res, err) {
    console.error('[ERROR]', err)

    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
            error: 'Resource already exists'
        })
    }

    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({
            error: err.errors?.[0]?.message || 'Validation error'
        })
    }

    if (err.message === 'User already exists!') {
        return res.status(409).json({
            error: err.message
        })
    }

    if (err.message === 'Invalid credentials!') {
        return res.status(401).json({
            error: err.message
        })
    }

    return res.status(500).json({
        error: 'Internal Server Error'
    })
}

module.exports = handleError