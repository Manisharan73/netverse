import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import DashboardPage from './pages/DashboardPage'
import NetworksPage from './pages/NetworksPage'
import { Toaster } from 'react-hot-toast'
import useAuthStore from './stores/auth.store'

function App() {
  const token = useAuthStore((state) => state.token)

  return (
    <>
      <Toaster position='top-right' />

      <BrowserRouter>
        <Routes>
          <Route
            path='/'
            element={
              token
                ? <Navigate to='/dashboard' replace />
                : <Navigate to='/login' replace />} />

          <Route
            path='/login'
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          <Route
            path='/register'
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          <Route path='/dashboard' element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />

          <Route path='/networks' element={
            <ProtectedRoute>
              <NetworksPage />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
