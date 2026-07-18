import { createContext, useState, useEffect } from 'react'
import authAPI from '../api/authAPI'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

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

  const login = async (email, password) => {
    try {
      // Login returns LoginResponse { success, tokens, user }
      const response = await authAPI.login({ username: email, password })
      const { user: userData, tokens } = response.data

      localStorage.setItem('access_token', tokens.access)
      localStorage.setItem('refresh_token', tokens.refresh)

      setUser(userData)
      setIsAuthenticated(true)

      toast.success(`Welcome back, ${userData.name}!`)
      return { success: true, user: userData }

    } catch (error) {
      const message = error.response?.data?.detail || 'Login failed'
      toast.error(message)
      return { success: false, message }
    }
  }

  const googleLogin = async (token) => {
    try {
      const response = await authAPI.googleLogin(token)
      const { user: userData, tokens } = response.data

      localStorage.setItem('access_token', tokens.access)
      localStorage.setItem('refresh_token', tokens.refresh)

      setUser(userData)
      setIsAuthenticated(true)

      toast.success(`Welcome back, ${userData.name}!`)
      return { success: true, user: userData }

    } catch (error) {
      const message = error.response?.data?.detail || 'Google Login failed'
      toast.error(message)
      return { success: false, message }
    }
  }

  const register = async (data) => {
    try {
      // Register returns UserResponse directly in FastAPI
      const response = await authAPI.register(data)
      
      toast.success('Account created successfully! Please login.')
      return { success: true }

    } catch (error) {
      const detail = error.response?.data?.detail
      const message = Array.isArray(detail) 
        ? detail.map(e => e.msg).join(', ') 
        : detail || 'Registration failed'
      
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
      toast.success('Logged out')
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
    login,
    googleLogin,
    register,
    logout,
    updateProfile,
    checkAuth,
    isAdmin: user?.role === 'store_admin' || user?.role === 'superadmin',
    isCustomer: user?.role === 'customer',
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}