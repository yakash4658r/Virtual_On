import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { useCart } from '../../hooks/useCart'
import CartList from '../../components/cart/CartList'
import CartSummary from '../../components/cart/CartSummary'
import { PageLoader } from '../../components/common/Loader'
import './CartPage.css'

function CartPage() {
  const { cartItems, cartCount, cartLoading, fetchCart } = useCart()

  useEffect(() => {
    fetchCart()
  }, [])

  if (cartLoading) return <PageLoader text="Loading cart..." />

  return (
    <div className="cart-page">
      <Link to="/catalog" className="back-link">
        <FiArrowLeft /> Continue Shopping
      </Link>

      <h1 className="section-title">
        Try-On Cart ({cartCount})
      </h1>
      <p className="section-subtitle">
        Select sarees to virtually try on. Upload your photo and
        see yourself wearing these sarees.
      </p>

      {cartCount === 0 ? (
        <div className="cart-empty">
          <div className="empty-state">
            <div className="empty-state-icon"></div>
            <p className="empty-state-text">
              Your try-on cart is empty
            </p>
            <Link to="/catalog">
              <button className="btn btn-primary" style={{ marginTop: '20px' }}>
                Browse Sarees
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items-section">
            <CartList items={cartItems} />
          </div>
          <div className="cart-summary-section">
            <CartSummary />
          </div>
        </div>
      )}
    </div>
  )
}

export default CartPage