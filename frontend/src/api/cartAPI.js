import axiosInstance from './axiosInstance'

const cartAPI = {

  // Get full cart
  getCart: () => {
    return axiosInstance.get('/cart/')
  },

  // Add saree to cart
  addToCart: (sareeId) => {
    return axiosInstance.post('/cart/add/', {
      saree_id: sareeId,
    })
  },

  // Remove item from cart
  removeFromCart: (itemId) => {
    return axiosInstance.delete(`/cart/remove/${itemId}/`)
  },

  // Clear entire cart
  clearCart: () => {
    return axiosInstance.delete('/cart/clear/')
  },

  // Get cart count
  getCount: () => {
    return axiosInstance.get('/cart/count/')
  },
}

export default cartAPI