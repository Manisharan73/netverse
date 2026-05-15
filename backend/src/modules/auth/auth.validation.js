function validateRegister(data) {
    const { username, email, password } = data

    if(!username || username.length < 3) {
        throw new Error('Username must be atleast 3 characters')
    }

    if(!email || !email.includes('@')) {
        throw new Error('Valid email required')
    }

    if(!password || password.length < 6) {
        throw new Error('Password must be atleast 6 characters')
    }

    return true
}

function validateLogin(data) {
    const { email, password } = data

    if(!email || !password) {
        throw new Error('Email and Password required')
    }

    return true
}

module.exports = {
    validateLogin,
    validateRegister
}