import { useState } from 'react'
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import './ProductImageGallery.css'

function ProductImageGallery({ images, isOpen, onClose, startIndex = 0 }) {
  const [currentIndex, setCurrentIndex] = useState(startIndex)

  if (!isOpen || !images || images.length === 0) return null

  const goNext = () => {
    setCurrentIndex((prev) =>
      prev >= images.length - 1 ? 0 : prev + 1
    )
  }

  const goPrev = () => {
    setCurrentIndex((prev) =>
      prev <= 0 ? images.length - 1 : prev - 1
    )
  }

  return (
    <div className="gallery-overlay" onClick={onClose}>
      <div
        className="gallery-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="gallery-close" onClick={onClose}>
          <FiX />
        </button>

        <button className="gallery-nav gallery-prev" onClick={goPrev}>
          <FiChevronLeft />
        </button>

        <div className="gallery-image-container">
          <img
            src={images[currentIndex]?.url}
            alt={images[currentIndex]?.type || 'Saree'}
            className="gallery-image"
          />
          <p className="gallery-caption">
            {images[currentIndex]?.type} ({currentIndex + 1}/{images.length})
          </p>
        </div>

        <button className="gallery-nav gallery-next" onClick={goNext}>
          <FiChevronRight />
        </button>

        <div className="gallery-dots">
          {images.map((_, index) => (
            <button
              key={index}
              className={`gallery-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProductImageGallery