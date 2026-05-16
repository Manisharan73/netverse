import { Navigate } from 'react-router-dom'
import useAuthStore from '../stores/auth.store'

function ProtectedRoute({ children }) {
    const token = useAuthStore((state) => state.token)

    if(!token) {
        return <Navigate to='/login' />
    }

    return children
}

export default ProtectedRoute