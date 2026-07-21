import { createContext, useState, useEffect } from 'react'
import authAPI from '../api/authAPI'
import toast from 'react-hot-toast'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // On app load — check if token exists
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token')
    const role = localStorage.getItem('role')

    if (!token) {
      setLoading(false)
      return
    }

    try {
      // Just check if token is valid
      await authAPI.getProfile()
      
      const storeInfoStr = localStorage.getItem('store_info')
      const storeInfo = storeInfoStr ? JSON.parse(storeInfoStr) : null
      
      setUser({ role, store_info: storeInfo })
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

  const login = async (id) => {
    try {
      const response = await authAPI.login(id)
      const { role, tokens, store_info } = response.data

      localStorage.setItem('access_token', tokens.access)
      localStorage.setItem('refresh_token', tokens.refresh)
      localStorage.setItem('role', role)
      
      if (store_info) {
        localStorage.setItem('store_info', JSON.stringify(store_info))
      }

      setUser({ role, store_info })
      setIsAuthenticated(true)

      toast.success(role === 'super_admin' ? 'Welcome Yakash' : `Welcome ${store_info.store_name}`)
      return { success: true, role }

    } catch (error) {
      const detail = error.response?.data?.detail
      const message = Array.isArray(detail) 
        ? detail.map(e => e.msg).join(', ') 
        : detail || 'Invalid ID'
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
      // Ignore
    } finally {
      localStorage.clear()
      setUser(null)
      setIsAuthenticated(false)
      toast.success('Logged out successfully')
    }
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
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