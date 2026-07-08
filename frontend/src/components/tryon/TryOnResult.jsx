import { useState } from 'react'
import { FiDownload, FiRefreshCw, FiMaximize2 } from 'react-icons/fi'
import { getImageUrl, getStatusLabel, downloadImage } from '../../utils/helpers'
import ImagePreview from '../common/ImagePreview'
import './TryOnResult.css'

function TryOnResult({ result, onRetry, onFullscreen }) {
  const { saree, status, result_image, error_message } = result

  return (
    <div className={`tryon-result-card status-${status}`}>
      {status === 'completed' && result_image ? (
        <>
          <div className="result-image-wrapper">
            <img
              src={getImageUrl(result_image)}
              alt={`Try-on ${saree?.name}`}
              className="result-image"
              onClick={() => onFullscreen?.(result)}
              onError={(e) => {
                e.target.src = 'https://placehold.co/400x500/8B1A4A/fff?text=Error'
              }}
            />
            <div className="result-image-actions">
              <button
                className="result-action-btn"
                onClick={() => onFullscreen?.(result)}
                title="View full"
              >
                <FiMaximize2 />
              </button>
              <button
                className="result-action-btn"
                onClick={() =>
                  downloadImage(
                    getImageUrl(result_image),
                    `tryon-${saree?.name}.png`
                  )
                }
                title="Download"
              >
                <FiDownload />
              </button>
            </div>
          </div>
          <div className="result-info">
            <p className="result-saree-name">{saree?.name}</p>
            <span className="status-badge completed">✓ Ready</span>
          </div>
        </>
      ) : status === 'processing' ? (
        <div className="result-processing">
          <div className="spinner"></div>
          <p className="processing-name">{saree?.name}</p>
          <span className="status-badge processing">Processing...</span>
        </div>
      ) : status === 'failed' ? (
        <div className="result-failed">
          <span className="failed-icon"></span>
          <p className="failed-name">{saree?.name}</p>
          <p className="failed-error">
            {error_message || 'Processing failed'}
          </p>
          <button
            className="btn btn-ghost btn-small"
            onClick={() => onRetry?.(result.id)}
          >
            <FiRefreshCw /> Retry
          </button>
        </div>
      ) : (
        <div className="result-pending">
          <span className="pending-icon"></span>
          <p>{saree?.name}</p>
          <span className="status-badge pending">Waiting...</span>
        </div>
      )}
    </div>
  )
}

export default TryOnResult