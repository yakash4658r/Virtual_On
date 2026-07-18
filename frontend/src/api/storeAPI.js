import axiosInstance from './axiosInstance'

const storeAPI = {
  getDashboardStats: () => {
    return axiosInstance.get('/store/dashboard/')
  },

  getSettings: () => {
    return axiosInstance.get('/store/settings/')
  },

  updateSettings: (data) => {
    return axiosInstance.put('/store/settings/', data)
  },

  getSessions: () => {
    return axiosInstance.get('/store/sessions/')
  }
}

export default storeAPI
