import { useLocation, useNavigate, useOutletContext } from 'react-router-dom'

function SareeDetailScreen() {
  const { deviceId } = useOutletContext()
  const navigate = useNavigate()
  const location = useLocation()
  const saree = location.state?.saree

  if (!saree) {
    return (
      <div className="mirror-welcome">
        <h2>No saree selected</h2>
        <button className="mirror-btn mirror-btn-primary" onClick={() => navigate(`/mirror/${deviceId}/search`)}>
          Go to Search
        </button>
      </div>
    )
  }

  const images = [
    saree.image_front, 
    saree.image_back, 
    saree.image_detail, 
    saree.image_drape
  ].filter(Boolean)

  // Fallback if no images
  if (images.length === 0) {
    images.push('/media/placeholder_saree.png')
  }

  return (
    <div className="mirror-detail">
      <button className="mirror-btn-back" onClick={() => navigate(`/mirror/${deviceId}/search`)}>
        ← Back
      </button>
      
      <div className="mirror-detail-images">
        {images.slice(0, 4).map((img, i) => (
          <img key={i} src={img} alt={`Saree view ${i + 1}`} />
        ))}
        {/* Fill empty slots */}
        {Array.from({ length: Math.max(0, 4 - images.length) }).map((_, i) => (
          <div key={`empty-${i}`} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }} />
        ))}
      </div>
      
      <div className="mirror-detail-info">
        <h1>{saree.name}</h1>
        <p className="price">₹{saree.price?.toLocaleString()}</p>
        
        <div className="meta-tags">
          {saree.color && <span className="mirror-meta-tag">🎨 {saree.color}</span>}
          {saree.fabric && <span className="mirror-meta-tag">🧵 {saree.fabric}</span>}
          {saree.occasion && <span className="mirror-meta-tag">✨ {saree.occasion}</span>}
        </div>
        
        {saree.description && (
          <p className="description">{saree.description}</p>
        )}
        
        <button 
          className="mirror-btn mirror-btn-primary mirror-btn-large"
          onClick={() => navigate(`/mirror/${deviceId}/camera`, { state: { saree } })}
          style={{ marginTop: '20px' }}
        >
          📷 TAKE YOUR PHOTO
        </button>
      </div>
    </div>
  )
}

export default SareeDetailScreen
