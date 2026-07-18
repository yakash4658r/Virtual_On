import { Outlet, useParams } from 'react-router-dom'
import { useState, useEffect, useRef, useCallback } from 'react'
import mirrorAPI from '../api/mirrorAPI'
import '../styles/mirror.css'

function MirrorLayout() {
  const { deviceId } = useParams()
  const [storeInfo, setStoreInfo] = useState(null)
  const [sessionToken, setSessionToken] = useState(null)
  const [error, setError] = useState(null)
  const inactivityTimer = useRef(null)

  // Fetch store info on mount
  useEffect(() => {
    if (deviceId) {
      mirrorAPI.getDeviceInfo(deviceId)
        .then(res => setStoreInfo(res.data.data))
        .catch(() => setError('Device not found. Please check the URL.'))
    }
  }, [deviceId])

  // Heartbeat every 30 seconds
  useEffect(() => {
    if (!deviceId) return
    const interval = setInterval(() => {
      mirrorAPI.heartbeat(deviceId).catch(() => {})
    }, 30000)
    return () => clearInterval(interval)
  }, [deviceId])

  // Inactivity auto-reset (60 seconds)
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
    inactivityTimer.current = setTimeout(() => {
      // Reset to welcome screen
      window.location.href = `/mirror/${deviceId}`
    }, 60000) // 60 seconds
  }, [deviceId])

  useEffect(() => {
    const events = ['touchstart', 'mousedown', 'keydown']
    events.forEach(e => window.addEventListener(e, resetInactivityTimer))
    resetInactivityTimer()
    return () => {
      events.forEach(e => window.removeEventListener(e, resetInactivityTimer))
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
    }
  }, [resetInactivityTimer])

  // Enter fullscreen on first touch
  useEffect(() => {
    const enterFullscreen = () => {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {})
      }
    }
    window.addEventListener('touchstart', enterFullscreen, { once: true })
    return () => window.removeEventListener('touchstart', enterFullscreen)
  }, [])

  if (error) {
    return (
      <div className="mirror-layout">
        <div className="mirror-welcome">
          <h1 style={{ color: '#e74c3c', fontSize: '36px' }}>⚠️ {error}</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="mirror-layout">
      <Outlet context={{ deviceId, storeInfo, sessionToken, setSessionToken }} />
    </div>
  )
}

export default MirrorLayout
