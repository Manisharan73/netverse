import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { registerUser } from '../services/auth.service'

function RegisterPage() {
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    })

    async function handleSubmit(e) {
        e.preventDefault()

        try {
            await registerUser(formData)

            alert('Registered successfully!')

            navigate('/login')
        } catch (err) {
            console.error(err)

            alert(
                err.response?.data?.error ||
                "Registration failed"
            )
        }
    }

    return (
        <>
            <div>
                <h1>Register</h1>

                <form onSubmit={handleSubmit}>
                    <input
                        type='text'
                        placeholder='Username'
                        value={formData.username}
                        onChange={(e) => {
                            setFormData({
                                ...formData,
                                username: e.target.value
                            })
                        }}
                    />

                    <input
                        type='email'
                        placeholder='Email'
                        value={formData.email}
                        onChange={(e) => {
                            setFormData({
                                ...formData,
                                email: e.target.value
                            })
                        }}
                    />

                    <input
                        type='password'
                        placeholder='Password'
                        value={formData.password}
                        onChange={(e) => {
                            setFormData({
                                ...formData,
                                password: e.target.value
                            })
                        }}
                    />

                    <button type='submit'>Register</button>
                </form>
            </div>
        </>
    )
}

export default RegisterPage