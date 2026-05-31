import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { registerUser } from '../services/auth.service'
import toast from 'react-hot-toast'
import '../styles/components/auth.css'

function RegisterPage() {
    const navigate = useNavigate()

    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    })

    async function handleSubmit(e) {
        e.preventDefault()

        if (!formData.username || !formData.email || !formData.password) {
            toast.error("All fields are required")
            return
        }

        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters")
            return
        }

        try {
            setLoading(true)
            toast.loading("Creating account...", { id: "register" })

            await registerUser(formData)

            toast.success("Account created successfully!", {
                id: "register"
            })

            setTimeout(() => {
                navigate('/login')
            }, 500)
        } catch (err) {
            toast.error(
                err.response?.data?.error ||
                "Registration failed",
                { id: "register" }
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
                    <p className="auth-subtitle">New Node Registration</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-input-group">
                        <input
                            className="auth-input"
                            type='text'
                            placeholder='Username'
                            value={formData.username}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    username: e.target.value
                                })
                            }
                        />
                    </div>

                    <div className="auth-input-group">
                        <input
                            className="auth-input"
                            type='email'
                            placeholder='Email Address'
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    email: e.target.value
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
                        {loading ? "Provisioning..." : "Register Node"}
                    </button>
                </form>

                <div className="auth-footer">
                    Already a registered node?{' '}
                    <span className="auth-link" onClick={() => navigate('/login')}>
                        Initialize session
                    </span>
                </div>
            </div>
        </div>
    )
}

export default RegisterPage