import axiosInstance from './axiosInstance'

const mirrorAPI = {
  // Get store info for welcome screen (no auth)
  getDeviceInfo: (deviceId) => {
    return axiosInstance.get(`/mirror/device/${deviceId}/info`)
  },

  // Start anonymous session
  startSession: (deviceId) => {
    const formData = new FormData()
    formData.append('device_id', deviceId)
    return axiosInstance.post('/mirror/session/start', formData)
  },

  // Upload customer photo
  uploadPhoto: (sessionToken, photoBlob) => {
    const formData = new FormData()
    formData.append('session_token', sessionToken)
    formData.append('photo', photoBlob, 'customer_photo.jpg')
    return axiosInstance.post('/mirror/upload-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // Start try-on
  startTryOn: (sessionToken, sareeId, customerPhotoUrl, deviceId, storeId) => {
    const formData = new FormData()
    formData.append('session_token', sessionToken)
    formData.append('saree_id', sareeId)
    formData.append('customer_photo_url', customerPhotoUrl)
    if (deviceId) formData.append('device_id', deviceId)
    if (storeId) formData.append('store_id', storeId)
    return axiosInstance.post('/mirror/tryon', formData)
  },

  // Poll try-on status
  getTryOnStatus: (jobId) => {
    return axiosInstance.get(`/mirror/tryon/${jobId}/status`)
  },

  // Get QR code data
  getQRData: (sessionToken) => {
    return axiosInstance.get(`/mirror/tryon/${sessionToken}/qr`)
  },

  // Lookup saree by barcode (no auth)
  searchBarcode: (barcodeId) => {
    return axiosInstance.get(`/products/barcode/${barcodeId}/`)
  },

  // Device heartbeat
  heartbeat: (deviceId) => {
    return axiosInstance.post(`/devices/${deviceId}/heartbeat`)
  }
}

export default mirrorAPI
