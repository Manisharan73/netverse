const { z } = require('zod')

const registerSchema = z.object({
    username: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .trim(),

    email: z
        .string()
        .email('Valid email required')
        .trim()
        .toLowerCase(),

    password: z
        .string()
        .min(6, 'Password must be at least 6 characters')
        .regex(/[a-zA-Z]/, 'Password must contain letters')
        .regex(/[0-9]/, 'Password must contain numbers')
})

const loginSchema = z.object({
    identifier: z
        .string()
        .min(1, 'Identifier required')
        .trim(),

    password: z
        .string()
        .min(1, 'Password required')
})

function validateRegister(data) {
    return registerSchema.parse(data)
}

function validateLogin(data) {
    return loginSchema.parse(data)
}

module.exports = {
    validateRegister,
    validateLogin,
    registerSchema,
    loginSchema
}