import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import './MirrorEntryPage.css'

const MirrorEntryPage = () => {
  const [loginId, setLoginId] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!loginId.trim()) return

    setLoading(true)
    // We renamed mirrorLogin to login in useAuth, or just use login
    const result = await login(loginId.trim())
    setLoading(false)

    if (result.success) {
      if (result.role === 'super_admin') {
        navigate('/superadmin')
      } else {
        navigate('/admin')
      }
    }
  }

  return (
    <div className="unified-login-container">
      <div className="unified-login-card">
        <h1 className="brand-title">Welcome to Yakash Tech</h1>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-container">
            <input
              type="text"
              placeholder="Enter Your ID"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              disabled={loading}
              autoComplete="off"
              autoFocus
              className="id-input"
            />
          </div>
          
          <button type="submit" className="continue-btn" disabled={loading || !loginId.trim()}>
            {loading ? 'WAIT...' : 'CONTINUE'}
          </button>
        </form>
        
        <p className="contact-text">
          Don't have an ID? Contact us at contact@yakash.tech
        </p>
      </div>
    </div>
  )
}

export default MirrorEntryPage
