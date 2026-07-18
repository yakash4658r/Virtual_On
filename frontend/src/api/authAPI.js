import axiosInstance from './axiosInstance'

const authAPI = {
  mirrorLogin: (mirrorId) => {
    return axiosInstance.post('/auth/mirror-login', { mirror_id: mirrorId })
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
  }
}

export default authAPI