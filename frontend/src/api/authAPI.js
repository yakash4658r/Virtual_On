import axiosInstance from './axiosInstance'

const authAPI = {

  register: (data) => {
    return axiosInstance.post('/auth/register', data)
  },

  login: (data) => {
    return axiosInstance.post('/auth/login', new URLSearchParams(data), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
  },

  googleLogin: (token) => {
    return axiosInstance.post('/auth/google', { token })
  },

  logout: (refreshToken) => {
    return axiosInstance.post('/auth/logout', {
      refresh_token: refreshToken,
    })
  },

  getProfile: () => {
    return axiosInstance.get('/auth/profile')
  },

  updateProfile: (data) => {
    return axiosInstance.put('/auth/profile', data)
  },

  changePassword: (data) => {
    return axiosInstance.post('/auth/change-password', data)
  },
}

export default authAPI