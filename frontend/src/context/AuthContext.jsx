import { createContext, useState, useEffect } from 'react'
import authAPI from '../api/authAPI'
import toast from 'react-hot-toast'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // On app load — check if token exists and fetch profile
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token')

    if (!token) {
      setLoading(false)
      return
    }

    try {
      const response = await authAPI.getProfile()
      // Profile returns UserResponse directly
      setUser(response.data)
      setIsAuthenticated(true)
    } catch (error) {
      // Token expired or invalid
      localStorage.clear()
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const mirrorLogin = async (mirrorId) => {
    try {
      const response = await authAPI.mirrorLogin(mirrorId)
      const { user: userData, tokens } = response.data

      localStorage.setItem('access_token', tokens.access)
      localStorage.setItem('refresh_token', tokens.refresh)

      setUser(userData)
      setIsAuthenticated(true)

      toast.success(`Access Granted: ${userData.name}`)
      return { success: true, user: userData }

    } catch (error) {
      const detail = error.response?.data?.detail
      const message = Array.isArray(detail) 
        ? detail.map(e => e.msg).join(', ') 
        : detail || 'Invalid ID or Access Denied'
      toast.error(message)
      return { success: false, message }
    }
  }

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        await authAPI.logout(refreshToken)
      }
    } catch (error) {
      // Ignore logout API error
    } finally {
      localStorage.clear()
      setUser(null)
      setIsAuthenticated(false)
      toast.success('Logged out successfully')
    }
  }

  const updateProfile = async (data) => {
    try {
      const response = await authAPI.updateProfile(data)
      setUser(response.data)
      toast.success('Profile updated')
      return { success: true }
    } catch (error) {
      toast.error('Failed to update profile')
      return { success: false }
    }
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    mirrorLogin,
    logout,
    updateProfile,
    checkAuth,
    isAdmin: user?.role === 'store_admin' || user?.role === 'super_admin',
    isSuperAdmin: user?.role === 'super_admin'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}