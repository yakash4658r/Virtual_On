import { useRef, useCallback } from 'react'
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom'
import Webcam from 'react-webcam'

function CameraScreen() {
  const { deviceId } = useOutletContext()
  const navigate = useNavigate()
  const location = useLocation()
  const saree = location.state?.saree
  const webcamRef = useRef(null)

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: 'user'
  }

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot()
    if (imageSrc) {
      navigate(`/mirror/${deviceId}/preview`, { 
        state: { saree, capturedImage: imageSrc } 
      })
    }
  }, [webcamRef, navigate, deviceId, saree])

  return (
    <div className="mirror-camera">
      <button className="mirror-btn-back" onClick={() => navigate(`/mirror/${deviceId}/saree`, { state: { saree } })}>
        ← Back
      </button>
      
      <p style={{ fontSize: '28px', marginBottom: '20px', fontWeight: '600' }}>
        📷 Stand in front of the camera
      </p>
      
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        className="camera-preview"
        mirrored={true}
      />
      
      <div className="mirror-camera-controls">
        <button 
          className="mirror-btn mirror-btn-primary mirror-btn-large"
          onClick={capture}
        >
          📸 CAPTURE
        </button>
      </div>
    </div>
  )
}

export default CameraScreen
