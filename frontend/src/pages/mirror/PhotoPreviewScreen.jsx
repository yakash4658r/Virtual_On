import { useLocation, useNavigate, useOutletContext } from 'react-router-dom'
import { useState } from 'react'
import mirrorAPI from '../../api/mirrorAPI'

function PhotoPreviewScreen() {
  const { deviceId, storeInfo } = useOutletContext()
  const navigate = useNavigate()
  const location = useLocation()
  const { saree, capturedImage } = location.state || {}
  const [submitting, setSubmitting] = useState(false)

  if (!capturedImage || !saree) {
    return (
      <div className="mirror-welcome">
        <h2>No photo captured</h2>
        <button className="mirror-btn mirror-btn-primary" onClick={() => navigate(`/mirror/${deviceId}/search`)}>
          Start Over
        </button>
      </div>
    )
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      // 1. Start a session
      const sessionRes = await mirrorAPI.startSession(deviceId)
      const { session_token, store_id } = sessionRes.data.data

      // 2. Upload the photo
      const blob = await fetch(capturedImage).then(r => r.blob())
      const uploadRes = await mirrorAPI.uploadPhoto(session_token, blob)
      const photoUrl = uploadRes.data.data.photo_url

      // 3. Start try-on
      const tryonRes = await mirrorAPI.startTryOn(session_token, saree.id, photoUrl, deviceId, store_id)
      const { job_id } = tryonRes.data.data

      // Navigate to processing
      navigate(`/mirror/${deviceId}/processing`, { 
        state: { saree, capturedImage, jobId: job_id, sessionToken: session_token } 
      })
    } catch (err) {
      console.error('Submit error:', err)
      setSubmitting(false)
    }
  }

  return (
    <div className="mirror-preview">
      <h2 style={{ fontSize: '34px', fontWeight: '700' }}>Your Photo</h2>
      
      <img src={capturedImage} alt="Captured" />
      
      <div className="mirror-preview-actions">
        <button 
          className="mirror-btn mirror-btn-secondary"
          onClick={() => navigate(`/mirror/${deviceId}/camera`, { state: { saree } })}
          disabled={submitting}
        >
          🔄 Retake
        </button>
        <button 
          className="mirror-btn mirror-btn-success mirror-btn-large"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? '⏳ Submitting...' : '✅ Submit'}
        </button>
      </div>
    </div>
  )
}

export default PhotoPreviewScreen
