import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiTrash2 } from 'react-icons/fi'
import { useCart } from '../../hooks/useCart'
import { formatPrice, getImageUrl } from '../../utils/helpers'
import ImagePreview from '../common/ImagePreview'
import './CartItem.css'

function CartItem({ item }) {
  const { removeFromCart } = useCart()
  const [removing, setRemoving] = useState(false)

  const { saree } = item

  const handleRemove = async () => {
    setRemoving(true)
    await removeFromCart(item.id)
    setRemoving(false)
  }

  return (
    <div className={`cart-item ${removing ? 'removing' : ''}`}>
      <Link
        to={`/product/${saree.slug}`}
        className="cart-item-image"
      >
        <ImagePreview
          src={saree.image_front}
          alt={saree.name}
          className="cart-img"
        />
      </Link>

      <div className="cart-item-info">
        <Link
          to={`/product/${saree.slug}`}
          className="cart-item-name"
        >
          {saree.name}
        </Link>

        <div className="cart-item-meta">
          <span>{saree.fabric}</span>
          <span className="dot">•</span>
          <span>{saree.color}</span>
          <span className="dot">•</span>
          <span>{saree.occasion}</span>
        </div>

        <div className="cart-item-barcode">
          Barcode: {saree.barcode_id}
        </div>

        <div className="cart-item-price">
          {formatPrice(saree.price)}
        </div>
      </div>

      <button
        className="cart-remove-btn"
        onClick={handleRemove}
        disabled={removing}
        title="Remove from cart"
      >
        {removing ? (
          <div className="spinner small"></div>
        ) : (
          <FiTrash2 />
        )}
      </button>
    </div>
  )
}

export default CartItem