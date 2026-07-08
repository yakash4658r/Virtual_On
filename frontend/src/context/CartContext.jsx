import { createContext, useState, useEffect, useCallback } from 'react'
import cartAPI from '../api/cartAPI'
import toast from 'react-hot-toast'
import { useContext } from 'react'
import { AuthContext } from './AuthContext'

export const CartContext = createContext(null)

export function CartProvider({ children }) {

  const { isAuthenticated, isCustomer } = useContext(AuthContext)

  const [cart, setCart] = useState(null)
  const [cartItems, setCartItems] = useState([])
  const [cartCount, setCartCount] = useState(0)
  const [cartLoading, setCartLoading] = useState(false)

  // Fetch cart when user logs in
  useEffect(() => {
    if (isAuthenticated && isCustomer) {
      fetchCart()
    } else {
      setCart(null)
      setCartItems([])
      setCartCount(0)
    }
  }, [isAuthenticated, isCustomer])

  const fetchCart = async () => {
    try {
      setCartLoading(true)
      const response = await cartAPI.getCart()
      const cartData = response.data.data

      setCart(cartData)
      setCartItems(cartData.items || [])
      setCartCount(cartData.total_items || 0)
    } catch (error) {
      console.error('Failed to fetch cart:', error)
    } finally {
      setCartLoading(false)
    }
  }

  const addToCart = async (sareeId) => {
    try {
      const response = await cartAPI.addToCart(sareeId)
      const cartData = response.data.data

      setCart(cartData)
      setCartItems(cartData.items || [])
      setCartCount(cartData.total_items || 0)

      toast.success(response.data.message)
      return { success: true }

    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add'
      toast.error(message)
      return { success: false, message }
    }
  }

  const removeFromCart = async (itemId) => {
    try {
      const response = await cartAPI.removeFromCart(itemId)
      const cartData = response.data.data

      setCart(cartData)
      setCartItems(cartData.items || [])
      setCartCount(cartData.total_items || 0)

      toast.success(response.data.message)
      return { success: true }

    } catch (error) {
      toast.error('Failed to remove item')
      return { success: false }
    }
  }

  const clearCart = async () => {
    try {
      const response = await cartAPI.clearCart()
      setCart(null)
      setCartItems([])
      setCartCount(0)

      toast.success(response.data.message)
      return { success: true }

    } catch (error) {
      toast.error('Failed to clear cart')
      return { success: false }
    }
  }

  const isInCart = useCallback((sareeId) => {
    return cartItems.some(
      (item) => item.saree?.id === sareeId
    )
  }, [cartItems])

  const value = {
    cart,
    cartItems,
    cartCount,
    cartLoading,
    addToCart,
    removeFromCart,
    clearCart,
    fetchCart,
    isInCart,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}