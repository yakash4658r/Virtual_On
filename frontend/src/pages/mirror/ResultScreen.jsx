import { useLocation, useNavigate, useOutletContext } from 'react-router-dom'
import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

function ResultScreen() {
  const { deviceId } = useOutletContext()
  const navigate = useNavigate()
  const location = useLocation()
  const { saree, capturedImage, resultImage, sessionToken, processingTime } = location.state || {}
  const [showQR, setShowQR] = useState(false)

  const downloadUrl = `${window.location.origin}/api/public/download/${sessionToken}`

  if (!resultImage) {
    return (
      <div className="mirror-welcome">
        <h2>No result available</h2>
        <button className="mirror-btn mirror-btn-primary" onClick={() => navigate(`/mirror/${deviceId}/search`)}>
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="mirror-result">
      <h2>✨ Your Virtual Try-On Result!</h2>
      
      {processingTime && (
        <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.4)' }}>
          Generated in {(processingTime / 1000).toFixed(1)}s
        </p>
      )}
      
      <div className="mirror-result-compare">
        <div className="result-card">
          <img src={capturedImage} alt="Your photo" />
          <p>Your Photo</p>
        </div>
        <div style={{ fontSize: '48px', display: 'flex', alignItems: 'center' }}>→</div>
        <div className="result-card">
          <img src={resultImage} alt="Try-on result" />
          <p>With {saree?.name || 'Saree'}</p>
        </div>
      </div>
      
      <div className="mirror-result-actions">
        <button 
          className="mirror-btn mirror-btn-primary"
          onClick={() => setShowQR(true)}
        >
          📱 Download via QR
        </button>
        <button 
          className="mirror-btn mirror-btn-secondary"
          onClick={() => navigate(`/mirror/${deviceId}/search`)}
        >
          🔄 Try Another Saree
        </button>
        <button 
          className="mirror-btn mirror-btn-secondary"
          onClick={() => navigate(`/mirror/${deviceId}/camera`, { state: { saree } })}
        >
          ✨ Try Different Angle
        </button>
      </div>
      
      {/* QR Code Modal */}
      {showQR && (
        <div className="mirror-qr-modal" onClick={() => setShowQR(false)}>
          <h3>📱 Scan to Download</h3>
          <div className="mirror-qr-box" onClick={(e) => e.stopPropagation()}>
            <QRCodeSVG 
              value={downloadUrl} 
              size={280} 
              bgColor="#ffffff" 
              fgColor="#000000"
              level="H"
            />
          </div>
          <p>Point your phone camera at this QR code</p>
          <p style={{ fontSize: '16px' }}>Link expires in 24 hours</p>
          <button 
            className="mirror-btn mirror-btn-secondary"
            onClick={() => setShowQR(false)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}

export default ResultScreen
