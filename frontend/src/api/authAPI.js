import axiosInstance from './axiosInstance'

const authAPI = {
  login: (id) => {
    return axiosInstance.post('/auth/login', { id: id })
  },

  logout: (refreshToken) => {
    return axiosInstance.post('/auth/logout', {
      refresh_token: refreshToken,
    })
  },

  getProfile: () => {
    return axiosInstance.get('/auth/profile')
  },
}

export default authAPI