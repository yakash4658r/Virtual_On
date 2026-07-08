import { FiX } from 'react-icons/fi'
import { getImageUrl, downloadImage } from '../../utils/helpers'
import './TryOnComparison.css'

function TryOnComparison({ result, customerPhoto, onClose }) {
  if (!result) return null

  return (
    <div className="comparison-overlay" onClick={onClose}>
      <div
        className="comparison-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="comparison-close" onClick={onClose}>
          <FiX />
        </button>

        <h2 className="comparison-title">
          {result.saree?.name}
        </h2>

        <div className="comparison-images">
          <div className="comparison-item">
            <img
              src={getImageUrl(customerPhoto)}
              alt="Original"
              className="comparison-image"
              onError={(e) => {
                e.target.src = 'https://placehold.co/400x500/333/fff?text=Original'
              }}
            />
            <p>Original Photo</p>
          </div>

          <div className="comparison-divider">
            <span>VS</span>
          </div>

          <div className="comparison-item">
            <img
              src={getImageUrl(result.result_image)}
              alt="Try-on result"
              className="comparison-image"
              onError={(e) => {
                e.target.src = 'https://placehold.co/400x500/8B1A4A/fff?text=Result'
              }}
            />
            <p>Virtual Try-On</p>
          </div>
        </div>

        <div className="comparison-actions">
          <button
            className="btn btn-primary"
            onClick={() =>
              downloadImage(
                getImageUrl(result.result_image),
                `tryon-${result.saree?.name}.png`
              )
            }
          >
             Download Result
          </button>
        </div>
      </div>
    </div>
  )
}

export default TryOnComparison