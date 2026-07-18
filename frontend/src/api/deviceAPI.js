import axiosInstance from './axiosInstance'

const deviceAPI = {
  // Get all devices for the current store
  getDevices: () => {
    return axiosInstance.get('/devices/')
  },

  // Register a new device
  registerDevice: (data) => {
    return axiosInstance.post('/devices/register', data)
  },

  // Get specific device
  getDevice: (deviceId) => {
    return axiosInstance.get(`/devices/${deviceId}`)
  },

  // Update device status
  updateStatus: (deviceId, status) => {
    return axiosInstance.put(`/devices/${deviceId}/status?status=${status}`)
  }
}

export default deviceAPI
