import CartItem from './CartItem'

function CartList({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon"></div>
        <p className="empty-state-text">Your cart is empty</p>
      </div>
    )
  }

  return (
    <div className="cart-list">
      {items.map((item) => (
        <CartItem key={item.id} item={item} />
      ))}
    </div>
  )
}

export default CartList