import api from './axiosInstance'

export const startSession = async (customerPhotoUrl) => {
  const res = await api.post('/kiosk/session/start', { customer_photo_url: customerPhotoUrl })
  return res.data
}

export const runTryOn = async (sessionId, sareeId) => {
  const res = await api.post(`/kiosk/session/${sessionId}/tryon`, { saree_id: sareeId })
  return res.data
}

export const toggleFavorite = async (sessionId, sareeId) => {
  const res = await api.post(`/kiosk/session/${sessionId}/favorite`, { saree_id: sareeId })
  return res.data
}

export const getSessionSummary = async (sessionId) => {
  const res = await api.get(`/kiosk/session/${sessionId}/summary`)
  return res.data
}

export const completeSession = async (sessionId) => {
  const res = await api.post(`/kiosk/session/${sessionId}/complete`)
  return res.data
}

// We can just use the existing product API for catalog
import productAPI from './productAPI'
export const getKioskProducts = async () => {
  const res = await productAPI.getAll({ page: 1, page_size: 100 })
  // API returns { success, data: [...sarees], pagination }
  return res.data?.data || []
}
