import { useLocation, useNavigate, useOutletContext } from 'react-router-dom'
import { useEffect, useState } from 'react'
import mirrorAPI from '../../api/mirrorAPI'

function ProcessingScreen() {
  const { deviceId } = useOutletContext()
  const navigate = useNavigate()
  const location = useLocation()
  const { saree, capturedImage, jobId, sessionToken } = location.state || {}
  const [dots, setDots] = useState('')

  // Animated dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 500)
    return () => clearInterval(interval)
  }, [])

  // Poll for result
  useEffect(() => {
    if (!jobId) return
    
    const poll = setInterval(async () => {
      try {
        const res = await mirrorAPI.getTryOnStatus(jobId)
        const data = res.data.data
        
        if (data.status === 'completed') {
          clearInterval(poll)
          navigate(`/mirror/${deviceId}/result`, {
            state: { 
              saree, 
              capturedImage, 
              resultImage: data.result_image,
              sessionToken,
              processingTime: data.processing_time_ms
            }
          })
        } else if (data.status === 'failed') {
          clearInterval(poll)
          // Go back with error
          navigate(`/mirror/${deviceId}/search`)
        }
      } catch (err) {
        // Keep polling
      }
    }, 1500)
    
    return () => clearInterval(poll)
  }, [jobId, navigate, deviceId, saree, capturedImage, sessionToken])

  return (
    <div className="mirror-processing">
      <div className="mirror-spinner" />
      
      <h2>AI is creating your virtual try-on{dots}</h2>
      <p>This usually takes 5-10 seconds</p>
      
      <div className="mirror-progress-bar">
        <div className="mirror-progress-fill" />
      </div>
      
      <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.3)', marginTop: '20px' }}>
        Powered by AI Virtual Try-On Technology
      </p>
    </div>
  )
}

export default ProcessingScreen
