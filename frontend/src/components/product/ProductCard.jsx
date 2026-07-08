import { Link } from 'react-router-dom'
import { FiShoppingBag, FiCheck } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../hooks/useCart'
import { formatPrice } from '../../utils/helpers'
import ImagePreview from '../common/ImagePreview'
import './ProductCard.css'

function ProductCard({ saree }) {
  const { isAuthenticated, isCustomer } = useAuth()
  const { addToCart, isInCart } = useCart()

  const inCart = isInCart(saree.id)

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      window.location.href = '/login'
      return
    }

    if (!inCart) {
      await addToCart(saree.id)
    }
  }

  return (
    <Link to={`/product/${saree.slug}`} className="product-card">
      <div className="product-image-wrapper">
        <ImagePreview
          src={saree.image_front}
          alt={saree.name}
          className="product-image"
        />

        {saree.is_featured && (
          <span className="product-badge featured">★ Featured</span>
        )}

        {!saree.in_stock && (
          <div className="product-overlay">
            <span>Out of Stock</span>
          </div>
        )}
      </div>

      <div className="product-info">
        <h3 className="product-name">{saree.name}</h3>

        <div className="product-meta">
          <span className="product-fabric">{saree.fabric}</span>
          <span className="product-dot">•</span>
          <span className="product-color">{saree.color}</span>
        </div>

        <div className="product-bottom">
          <span className="product-price">{formatPrice(saree.price)}</span>

          {isAuthenticated && isCustomer && saree.in_stock && (
            <button
              className={`product-cart-btn ${inCart ? 'in-cart' : ''}`}
              onClick={handleAddToCart}
              disabled={inCart}
            >
              {inCart ? (
                <><FiCheck /> Added</>
              ) : (
                <><FiShoppingBag /> Add</>
              )}
            </button>
          )}
        </div>
      </div>
    </Link>
  )
}

export default ProductCard