import { formatPrice } from '../../utils/helpers'
import './ProductDetails.css'

function ProductDetails({ saree }) {
  if (!saree) return null

  return (
    <div className="product-details-card">
      <h3>Product Details</h3>
      <table className="details-table">
        <tbody>
          <tr>
            <td>Name</td>
            <td>{saree.name}</td>
          </tr>
          <tr>
            <td>Price</td>
            <td className="price-cell">{formatPrice(saree.price)}</td>
          </tr>
          <tr>
            <td>Fabric</td>
            <td>{saree.fabric}</td>
          </tr>
          <tr>
            <td>Color</td>
            <td>{saree.color}</td>
          </tr>
          <tr>
            <td>Occasion</td>
            <td>{saree.occasion}</td>
          </tr>
          {saree.category && (
            <tr>
              <td>Category</td>
              <td>{saree.category.name}</td>
            </tr>
          )}
          <tr>
            <td>Barcode</td>
            <td>{saree.barcode_id}</td>
          </tr>
          <tr>
            <td>Stock</td>
            <td>
              <span className={saree.in_stock ? 'text-success' : 'text-error'}>
                {saree.in_stock ? `${saree.stock_quantity} available` : 'Out of stock'}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default ProductDetails