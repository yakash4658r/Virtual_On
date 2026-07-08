import ProductCard from './ProductCard'
import './ProductGrid.css'

function ProductGrid({ sarees, emptyMessage = 'No sarees found' }) {
  if (!sarees || sarees.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon"></div>
        <p className="empty-state-text">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="product-grid">
      {sarees.map((saree) => (
        <ProductCard key={saree.id} saree={saree} />
      ))}
    </div>
  )
}

export default ProductGrid