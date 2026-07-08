import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FiArrowLeft, FiCamera } from 'react-icons/fi'
import { useCart } from '../../hooks/useCart'
import { useTryon } from '../../hooks/useTryon'
import PhotoUpload from '../../components/tryon/PhotoUpload'
import CameraCapture from '../../components/tryon/CameraCapture'
import TryOnSlot from '../../components/tryon/TryOnSlot'
import Button from '../../components/common/Button'
import { PageLoader } from '../../components/common/Loader'
import './TryOnPage.css'

function TryOnPage() {
  const navigate = useNavigate()
  const { cartItems, cartCount, cartLoading, fetchCart } = useCart()
  const { startTryOn, isProcessing } = useTryon()

  const [photoFile, setPhotoFile] = useState(null)
  const [inputMethod, setInputMethod] = useState('upload')
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    fetchCart()
  }, [])

  const handlePhotoSelect = (file) => {
    setPhotoFile(file)
  }

  const handleStartTryOn = async () => {
    if (!photoFile) return
    if (cartCount === 0) return

    setStarting(true)
    const result = await startTryOn(photoFile)
    setStarting(false)

    if (result.success) {
      navigate(`/tryon/result/${result.sessionId}`)
    }
  }

  if (cartLoading) return <PageLoader text="Loading..." />

  if (cartCount === 0) {
    return (
      <div className="tryon-page">
        <div className="empty-state">
          <div className="empty-state-icon"></div>
          <p className="empty-state-text">
            Your cart is empty. Add sarees to try on first.
          </p>
          <Link to="/catalog">
            <Button variant="primary" style={{ marginTop: '20px' }}>
              Browse Sarees
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="tryon-page">
      <Link to="/cart" className="back-link">
        <FiArrowLeft /> Back to Cart
      </Link>

      <h1 className="section-title">Virtual Try-On</h1>
      <p className="section-subtitle">
        Upload your photo and see yourself in {cartCount} selected sarees
      </p>

      {/* Selected sarees preview */}
      <div className="tryon-selected">
        <h3>Selected Sarees ({cartCount})</h3>
        <div className="tryon-slots-row">
          {cartItems.map((item, index) => (
            <TryOnSlot key={item.id} item={item} index={index} />
          ))}
        </div>
      </div>

      {/* Photo input method toggle */}
      <div className="input-method-toggle">
        <button
          className={`method-btn ${inputMethod === 'upload' ? 'active' : ''}`}
          onClick={() => {
            setInputMethod('upload')
            setPhotoFile(null)
          }}
        >
           Upload Photo
        </button>
        <button
          className={`method-btn ${inputMethod === 'camera' ? 'active' : ''}`}
          onClick={() => {
            setInputMethod('camera')
            setPhotoFile(null)
          }}
        >
           Use Camera
        </button>
      </div>

      {/* Photo input */}
      <div className="tryon-photo-section">
        {inputMethod === 'upload' ? (
          <PhotoUpload
            onPhotoSelect={handlePhotoSelect}
            selectedPhoto={photoFile}
          />
        ) : (
          <CameraCapture onCapture={handlePhotoSelect} />
        )}
      </div>

      {/* Start button */}
      {photoFile && (
        <div className="tryon-start-section">
          <Button
            variant="success"
            size="large"
            onClick={handleStartTryOn}
            loading={starting}
            disabled={starting || isProcessing}
            icon={<FiCamera />}
          >
            {starting
              ? 'Starting AI Try-On...'
              : `Generate Try-On for ${cartCount} Sarees`}
          </Button>

          <p className="tryon-time-estimate">
             Estimated time: {cartCount * 20}-{cartCount * 40} seconds
          </p>
        </div>
      )}
    </div>
  )
}

export default TryOnPage