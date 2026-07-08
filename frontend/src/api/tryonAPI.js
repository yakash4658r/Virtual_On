import axiosInstance from './axiosInstance'

const tryonAPI = {

  // Start try-on (upload customer photo)
  startTryOn: (photoFile) => {
    const formData = new FormData()
    formData.append('customer_photo', photoFile)

    return axiosInstance.post('/tryon/start/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // Poll session status
  getStatus: (sessionId) => {
    return axiosInstance.get(`/tryon/status/${sessionId}/`)
  },

  // Get try-on history
  getHistory: (params = {}) => {
    return axiosInstance.get('/tryon/history/', { params })
  },

  // Get single session detail
  getDetail: (sessionId) => {
    return axiosInstance.get(`/tryon/detail/${sessionId}/`)
  },

  // Delete session
  deleteSession: (sessionId) => {
    return axiosInstance.delete(`/tryon/detail/${sessionId}/`)
  },

  // Retry failed result
  retryResult: (resultId) => {
    return axiosInstance.post(`/tryon/retry/${resultId}/`)
  },

  // ====== ADMIN ======

  // Store dashboard
  getDashboard: () => {
    return axiosInstance.get('/store/dashboard/')
  },

  // Store settings
  getStoreSettings: () => {
    return axiosInstance.get('/store/settings/')
  },

  // Update store settings
  updateStoreSettings: (data) => {
    return axiosInstance.put('/store/settings/', data)
  },

  // Admin — all try-on history
  adminGetHistory: (params = {}) => {
    return axiosInstance.get('/store/tryon-history/', { params })
  },
}

export default tryonAPI