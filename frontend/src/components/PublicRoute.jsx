import { Navigate } from 'react-router-dom'
import useAuthStore from '../stores/auth.store'

function PublicRoute({ children }) {
    const token = useAuthStore((state) => state.token)

    if (token) {
        return <Navigate to='/dashboard' replace />
    }

    return children
}

export default PublicRoute