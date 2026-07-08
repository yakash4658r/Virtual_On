import { FiShoppingBag, FiCheck } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../hooks/useCart'
import Button from '../common/Button'

function CartButton({ sareeId, size = 'medium' }) {
  const { isAuthenticated } = useAuth()
  const { addToCart, isInCart } = useCart()

  const inCart = isInCart(sareeId)

  const handleClick = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login'
      return
    }
    if (!inCart) {
      await addToCart(sareeId)
    }
  }

  return (
    <Button
      variant={inCart ? 'success' : 'primary'}
      size={size}
      onClick={handleClick}
      disabled={inCart}
      icon={inCart ? <FiCheck /> : <FiShoppingBag />}
    >
      {inCart ? 'In Cart' : 'Add to Cart'}
    </Button>
  )
}

export default CartButton