import api from './axiosInstance'

const superadminAPI = {
  // Stores
  getStores: () => api.get('/superadmin/stores'),
  getStoreById: (storeId) => api.get(`/superadmin/stores/${storeId}`),
  createStore: (data) => api.post('/superadmin/stores', data),
  updateStore: (storeId, data) => api.put(`/superadmin/stores/${storeId}`, data),
  addCredits: (storeId, amount) => api.post(`/superadmin/stores/${storeId}/credits`, { amount }),
  deactivateStore: (storeId) => api.delete(`/superadmin/stores/${storeId}`),
  
  // Devices
  getAllDevices: () => api.get('/superadmin/devices'),
  assignDevice: (storeId, deviceId, deviceName) =>
    api.post(`/superadmin/stores/${storeId}/devices?device_id=${deviceId}&device_name=${encodeURIComponent(deviceName)}`),
  
  // Analytics
  getGlobalAnalytics: () => api.get('/superadmin/analytics'),
}

export default superadminAPI
