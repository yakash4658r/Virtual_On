import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiShoppingBag, FiCheck, FiArrowLeft, FiTag } from 'react-icons/fi'
import productAPI from '../../api/productAPI'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../hooks/useCart'
import { formatPrice, getImageUrl } from '../../utils/helpers'
import ImagePreview from '../../components/common/ImagePreview'
import Button from '../../components/common/Button'
import { PageLoader } from '../../components/common/Loader'
import './ProductDetailPage.css'

function ProductDetailPage() {
  const { slug } = useParams()
  const { isAuthenticated, isCustomer } = useAuth()
  const { addToCart, isInCart } = useCart()

  const [saree, setSaree] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    loadSaree()
  }, [slug])

  const loadSaree = async () => {
    try {
      setLoading(true)
      const res = await productAPI.getBySlug(slug)
      const sareeData = res.data.data

      setSaree(sareeData)
      setSelectedImage(
        getImageUrl(sareeData.image_front) || null
      )
    } catch (error) {
      console.error('Failed to load saree:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login'
      return
    }

    setAddingToCart(true)
    await addToCart(saree.id)
    setAddingToCart(false)
  }

  if (loading) return <PageLoader text="Loading saree details..." />

  if (!saree) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon"></div>
        <p className="empty-state-text">Saree not found</p>
        <Link to="/catalog" className="btn btn-primary" style={{ marginTop: '20px' }}>
          Back to Catalog
        </Link>
      </div>
    )
  }

  const inCart = isInCart(saree.id)

  // Collect all available images
  const allImages = []
  if (saree.image_front) allImages.push({ type: 'Front View', url: getImageUrl(saree.image_front) })
  if (saree.image_back) allImages.push({ type: 'Back View', url: getImageUrl(saree.image_back) })
  if (saree.image_closeup) allImages.push({ type: 'Close-up', url: getImageUrl(saree.image_closeup) })
  if (saree.image_pallu) allImages.push({ type: 'Pallu Detail', url: getImageUrl(saree.image_pallu) })

  return (
    <div className="detail-page">
      <Link to="/catalog" className="back-link">
        <FiArrowLeft /> Back to Catalog
      </Link>

      <div className="detail-container">
        {/* Left — Images */}
        <div className="detail-images">
          <div className="main-image-wrapper">
            <img
              src={selectedImage || getImageUrl(saree.image_front)}
              alt={saree.name}
              className="main-image"
              onError={(e) => {
                e.target.src = 'https://placehold.co/600x800/8B1A4A/fff?text=No+Image'
              }}
            />
          </div>

          {allImages.length > 1 && (
            <div className="thumbnail-row">
              {allImages.map((img, index) => (
                <div
                  key={index}
                  className={`thumbnail ${selectedImage === img.url ? 'active' : ''}`}
                  onClick={() => setSelectedImage(img.url)}
                >
                  <img
                    src={img.url}
                    alt={img.type}
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/100x100/8B1A4A/fff?text=N/A'
                    }}
                  />
                  <span>{img.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right — Details */}
        <div className="detail-info">
          {saree.category && (
            <span className="detail-category">
              {saree.category.name}
            </span>
          )}

          <h1 className="detail-name">{saree.name}</h1>

          <div className="detail-price">
            {formatPrice(saree.price)}
          </div>

          <div className="detail-meta-grid">
            <div className="meta-item">
              <span className="meta-label">Fabric</span>
              <span className="meta-value">{saree.fabric}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Color</span>
              <span className="meta-value">{saree.color}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Occasion</span>
              <span className="meta-value">{saree.occasion}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Availability</span>
              <span className={`meta-value ${saree.in_stock ? 'in-stock' : 'out-stock'}`}>
                {saree.in_stock ? '✓ In Stock' : '✗ Out of Stock'}
              </span>
            </div>
          </div>

          {saree.barcode_id && (
            <div className="detail-barcode">
              <FiTag />
              <span>Barcode: {saree.barcode_id}</span>
            </div>
          )}

          {saree.description && (
            <div className="detail-description">
              <h3>Description</h3>
              <p>{saree.description}</p>
            </div>
          )}

          {/* Actions */}
          <div className="detail-actions">
            {saree.in_stock && isCustomer && (
              <Button
                variant={inCart ? 'success' : 'primary'}
                size="large"
                fullWidth
                onClick={handleAddToCart}
                loading={addingToCart}
                disabled={inCart}
                icon={inCart ? <FiCheck /> : <FiShoppingBag />}
              >
                {inCart ? 'Added to Try-On Cart' : 'Add to Try-On Cart'}
              </Button>
            )}

            {!isAuthenticated && (
              <Link to="/login" style={{ width: '100%' }}>
                <Button variant="primary" size="large" fullWidth>
                  Login to Try On
                </Button>
              </Link>
            )}

            {inCart && (
              <Link to="/cart" style={{ width: '100%' }}>
                <Button variant="secondary" size="medium" fullWidth>
                  Go to Cart →
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage