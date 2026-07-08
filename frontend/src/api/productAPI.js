import axiosInstance from './axiosInstance'

const productAPI = {

  // Get all sarees with filters
  getAll: (params = {}) => {
    return axiosInstance.get('/products/', { params })
  },

  // Get single saree by slug
  getBySlug: (slug) => {
    return axiosInstance.get(`/products/${slug}/`)
  },

  // Get saree by barcode
  getByBarcode: (barcodeId) => {
    return axiosInstance.get(`/products/barcode/${barcodeId}/`)
  },

  // Get categories
  getCategories: () => {
    return axiosInstance.get('/products/categories/')
  },

  // ====== ADMIN ======

  // Admin — get all sarees (includes inactive)
  adminGetAll: (params = {}) => {
    return axiosInstance.get('/products/admin/list/', { params })
  },

  // Admin — create saree with images
  adminCreate: (formData) => {
    return axiosInstance.post('/products/admin/create/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // Admin — update saree
  adminUpdate: (id, formData) => {
    return axiosInstance.put(`/products/admin/${id}/update/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // Admin — delete saree
  adminDelete: (id) => {
    return axiosInstance.delete(`/products/admin/${id}/update/`)
  },

  // Admin — create category
  adminCreateCategory: (data) => {
    return axiosInstance.post('/products/admin/categories/create/', data)
  },

  // Admin — get all barcodes
  adminGetAllBarcodes: () => {
    return axiosInstance.get('/products/admin/barcodes/all/')
  },

  // Admin — get single barcode
  adminGetBarcode: (id) => {
    return axiosInstance.get(`/products/admin/${id}/barcode/`)
  },
}

export default productAPI