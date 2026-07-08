import { Link } from 'react-router-dom'
import { FiCamera, FiTrash2 } from 'react-icons/fi'
import { useCart } from '../../hooks/useCart'
import { MAX_CART_ITEMS } from '../../utils/constants'
import Button from '../common/Button'
import './CartSummary.css'

function CartSummary() {
  const { cartItems, cartCount, clearCart } = useCart()

  const handleClear = async () => {
    if (window.confirm('Clear all items from cart?')) {
      await clearCart()
    }
  }

  return (
    <div className="cart-summary">
      <h3 className="summary-title">Try-On Summary</h3>

      <div className="summary-count">
        <span>Selected Sarees</span>
        <span className="count-value">
          {cartCount} / {MAX_CART_ITEMS}
        </span>
      </div>

      <div className="summary-progress">
        <div
          className="progress-bar"
          style={{
            width: `${(cartCount / MAX_CART_ITEMS) * 100}%`
          }}
        />
      </div>

      <p className="summary-note">
        You can try on up to {MAX_CART_ITEMS} sarees at once
      </p>

      <div className="summary-sarees">
        {cartItems.map((item, index) => (
          <div key={item.id} className="summary-saree-item">
            <span className="summary-num">{index + 1}</span>
            <span className="summary-saree-name">
              {item.saree?.name}
            </span>
          </div>
        ))}
      </div>

      <div className="summary-actions">
        <Link to="/tryon" style={{ width: '100%' }}>
          <Button
            variant="success"
            size="large"
            fullWidth
            disabled={cartCount === 0}
            icon={<FiCamera />}
          >
            Start Virtual Try-On
          </Button>
        </Link>

        {cartCount > 0 && (
          <Button
            variant="ghost"
            size="small"
            fullWidth
            onClick={handleClear}
            icon={<FiTrash2 />}
          >
            Clear Cart
          </Button>
        )}

        <Link to="/catalog" style={{ width: '100%' }}>
          <Button variant="secondary" size="medium" fullWidth>
            Continue Browsing
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default CartSummary