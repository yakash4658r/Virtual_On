import api from './axiosInstance'

const superadminAPI = {
  // Stores
  getStores: () => api.get('/superadmin/stores'),
  createStore: (data) => api.post('/superadmin/stores', data),
  updateStore: (storeId, data) => api.put(`/superadmin/stores/${storeId}`, data),
  deactivateStore: (storeId) => api.delete(`/superadmin/stores/${storeId}`),
  
  // Devices
  assignDevice: (storeId, deviceId, deviceName) =>
    api.post(`/superadmin/stores/${storeId}/devices?device_id=${deviceId}&device_name=${encodeURIComponent(deviceName)}`),
  
  // Analytics
  getGlobalAnalytics: () => api.get('/superadmin/analytics'),
}

export default superadminAPI
