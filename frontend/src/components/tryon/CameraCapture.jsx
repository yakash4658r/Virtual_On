import { useState, useRef, useEffect } from 'react'
import { FiCamera, FiRotateCcw, FiCheck } from 'react-icons/fi'
import './CameraCapture.css'

function CameraCapture({ onCapture }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const [stream, setStream] = useState(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [captured, setCaptured] = useState(null)
  const [countdown, setCountdown] = useState(null)
  const [cameraError, setCameraError] = useState('')

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      setCameraError('')
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1080 },
          height: { ideal: 1440 },
          facingMode: 'user',
        },
        audio: false,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        setCameraReady(true)
      }
    } catch (error) {
      setCameraError(
        'Camera access denied. Please allow camera permission in your browser.'
      )
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
      setCameraReady(false)
    }
  }

  const startCountdown = () => {
    setCountdown(3)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          capturePhoto()
          return null
        }
        return prev - 1
      })
    }, 1000)
  }

  const capturePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0)

    canvas.toBlob(
      (blob) => {
        const previewUrl = URL.createObjectURL(blob)
        setCaptured(previewUrl)

        const file = new File([blob], 'camera_photo.jpg', {
          type: 'image/jpeg',
        })
        onCapture(file)
        stopCamera()
      },
      'image/jpeg',
      0.92
    )
  }

  const retake = () => {
    setCaptured(null)
    setCountdown(null)
    onCapture(null)
    startCamera()
  }

  return (
    <div className="camera-capture">
      {!cameraReady && !captured && (
        <div className="camera-start">
          <div className="camera-start-icon"></div>
          <h3>Use Your Camera</h3>
          <p>Take a photo directly from your device camera</p>
          <button
            className="btn btn-primary"
            onClick={startCamera}
            style={{ marginTop: '16px' }}
          >
            <FiCamera /> Open Camera
          </button>
          {cameraError && (
            <p className="camera-error">{cameraError}</p>
          )}
        </div>
      )}

      {cameraReady && !captured && (
        <div className="camera-live">
          <div className="camera-viewport">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="camera-video"
            />

            <div className="camera-guide">
              <div className="guide-outline"></div>
            </div>

            {countdown && (
              <div className="camera-countdown">{countdown}</div>
            )}
          </div>

          <p className="camera-tip">
            Stand straight, face the camera, ensure good lighting
          </p>

          <div className="camera-controls">
            <button
              className="btn btn-primary btn-large"
              onClick={startCountdown}
              disabled={countdown !== null}
            >
              <FiCamera /> Capture (3s countdown)
            </button>
            <button
              className="btn btn-ghost"
              onClick={stopCamera}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {captured && (
        <div className="camera-result">
          <img
            src={captured}
            alt="Captured photo"
            className="captured-image"
          />
          <div className="camera-result-actions">
            <p className="preview-text">
              <FiCheck /> Photo captured
            </p>
            <button className="preview-change" onClick={retake}>
              <FiRotateCcw /> Retake
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}

export default CameraCapture