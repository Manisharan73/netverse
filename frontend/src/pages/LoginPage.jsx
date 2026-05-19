import { useNavigate } from 'react-router-dom'
import useAuthStore from '../stores/auth.store'
import { useState } from 'react'
import { loginUser } from '../services/auth.service'

function LoginPage() {
    const navigate = useNavigate()

    const login = useAuthStore((state) => state.login)

    const [formData, setFormData] = useState({
        identifier: '',
        password: ''
    })

    async function handleSubmit(e) {
        e.preventDefault()

        try {
            const data = await loginUser(formData)

            login(data)

            navigate('/dashboard')
        } catch (err) {
            console.error(err)

            alert(
                err.response?.data?.error ||
                "Login failed"
            )
        }
    }

    return (
        <>
            <div>
                <h1>Login</h1>

                <form onSubmit={handleSubmit}>
                    <input
                        type='text'
                        placeholder='Username or Email'
                        value={formData.identifier}
                        onChange={(e) => {
                            setFormData({
                                ...formData,
                                identifier: e.target.value
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

                    <button type='submit'>Login</button>
                </form>
            </div>
        </>
    )
}

export default LoginPage