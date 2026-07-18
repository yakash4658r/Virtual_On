import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — auto attach token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor — handle 401 auto refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If 401 and not already retried
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')

        if (!refreshToken) {
          // No refresh token — logout
          localStorage.clear()
          window.location.href = '/login'
          return Promise.reject(error)
        }

        // Try refresh
        const response = await axios.post(
          `${API_URL}/auth/token/refresh/`,
          { refresh_token: refreshToken }
        )

        const { access, refresh } = response.data.data

        localStorage.setItem('access_token', access)
        localStorage.setItem('refresh_token', refresh)

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${access}`
        return axiosInstance(originalRequest)

      } catch (refreshError) {
        // Refresh failed — logout
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance