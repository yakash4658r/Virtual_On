import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import './MirrorEntryPage.css'

const MirrorEntryPage = () => {
  const [mirrorId, setMirrorId] = useState('')
  const [loading, setLoading] = useState(false)
  const { mirrorLogin } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!mirrorId.trim()) return

    setLoading(true)
    const result = await mirrorLogin(mirrorId)
    setLoading(false)

    if (result.success) {
      if (result.user.role === 'super_admin') {
        navigate('/superadmin')
      } else {
        // Assume kiosk/store_admin mode
        localStorage.setItem('deviceId', mirrorId)
        navigate('/mirror/' + mirrorId)
      }
    }
  }

  return (
    <div className="mirror-entry-container">
      <div className="mirror-entry-card">
        <h1>AI Smart Mirror</h1>
        <p>Enter your Mirror ID to start</p>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="password"
              placeholder="Mirror ID"
              value={mirrorId}
              onChange={(e) => setMirrorId(e.target.value)}
              disabled={loading}
              autoComplete="off"
              autoFocus
            />
          </div>
          <button type="submit" disabled={loading || !mirrorId.trim()}>
            {loading ? 'Authenticating...' : 'Launch Mirror'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default MirrorEntryPage
