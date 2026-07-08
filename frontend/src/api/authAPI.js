import axiosInstance from './axiosInstance'

const authAPI = {

  register: (data) => {
    return axiosInstance.post('/auth/register/', data)
  },

  login: (data) => {
    return axiosInstance.post('/auth/login/', data)
  },

  logout: (refreshToken) => {
    return axiosInstance.post('/auth/logout/', {
      refresh_token: refreshToken,
    })
  },

  getProfile: () => {
    return axiosInstance.get('/auth/profile/')
  },

  updateProfile: (data) => {
    return axiosInstance.put('/auth/profile/', data)
  },

  changePassword: (data) => {
    return axiosInstance.post('/auth/change-password/', data)
  },
}

export default authAPI