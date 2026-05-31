import { useNavigate } from 'react-router-dom'
import useAuthStore from '../stores/auth.store'
import { useState } from 'react'
import { loginUser } from '../services/auth.service'
import toast from 'react-hot-toast'
import '../styles/components/auth.css'

function LoginPage() {
    const navigate = useNavigate()
    const login = useAuthStore((state) => state.login)

    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        identifier: '',
        password: ''
    })

    async function handleSubmit(e) {
        e.preventDefault()

        if (!formData.identifier || !formData.password) {
            toast.error("All fields are required")
            return
        }

        try {
            setLoading(true)

            toast.loading("Logging in...", { id: "login" })

            const data = await loginUser(formData)

            login(data)

            toast.success("Login successful!", { id: "login" })

            navigate('/dashboard')

        } catch (err) {
            toast.error(
                err.response?.data?.error ||
                "Login failed",
                { id: "login" }
            )

        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-container">
            <div className="orb orb-1"></div>
            <div className="orb orb-2"></div>
            
            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-title">Net<span>Verse</span></h1>
                    <p className="auth-subtitle">Authentication Gateway</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-input-group">
                        <input
                            className="auth-input"
                            type='text'
                            placeholder='Username or Email'
                            value={formData.identifier}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    identifier: e.target.value
                                })
                            }
                        />
                    </div>

                    <div className="auth-input-group">
                        <input
                            className="auth-input"
                            type='password'
                            placeholder='Password'
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    password: e.target.value
                                })
                            }
                        />
                    </div>

                    <button className="auth-button" type='submit' disabled={loading}>
                        {loading ? "Authenticating..." : "Initialize Session"}
                    </button>
                </form>

                <div className="auth-footer">
                    Unregistered node?{' '}
                    <span className="auth-link" onClick={() => navigate('/register')}>
                        Request access
                    </span>
                </div>
            </div>
        </div>
    )
}

export default LoginPage