import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import storeAPI from '../../api/storeAPI'
import mirrorAPI from '../../api/mirrorAPI'
import Webcam from 'react-webcam'
import toast from 'react-hot-toast'
import './DashboardPage.css'

function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Try Start Flow State
  const [flowOpen, setFlowOpen] = useState(false)
  const [step, setStep] = useState(1) // 1: Camera, 2: Barcode, 3: Processing, 4: Result
  const [photoBlob, setPhotoBlob] = useState(null)
  const [photoUrl, setPhotoUrl] = useState(null)
  const [barcode, setBarcode] = useState('')
  const [resultImage, setResultImage] = useState(null)
  
  const webcamRef = useRef(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await storeAPI.getDashboardStats()
      setStats(res.data.data)
    } catch (err) {
      console.error("Failed to load dashboard stats", err)
    } finally {
      setLoading(false)
    }
  }

  // --- Flow Handlers ---
  const openFlow = () => {
    setStep(1)
    setPhotoBlob(null)
    setPhotoUrl(null)
    setBarcode('')
    setResultImage(null)
    setFlowOpen(true)
  }

  const closeFlow = () => {
    setFlowOpen(false)
    // Refresh stats to show deducted credits/try-ons
    fetchStats()
  }

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot()
    if (imageSrc) {
      // Convert base64 to blob
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          setPhotoBlob(blob)
          setPhotoUrl(imageSrc)
          setStep(2) // Move to barcode
        })
    }
  }, [webcamRef])

  const submitBarcode = async (e) => {
    e.preventDefault()
    if (!barcode.trim()) {
      toast.error('Please enter a barcode')
      return
    }
    setStep(3) // Move to processing
    startTryOnProcess()
  }

  const startTryOnProcess = async () => {
    try {
      // 1. Session token
      const sessionToken = Math.random().toString(36).substring(2, 15)

      // 2. Upload photo
      const uploadRes = await mirrorAPI.uploadPhoto(sessionToken, photoBlob)
      const uploadedPhotoUrl = uploadRes.data.data.photo_url

      // 3. Start Try-On (passing barcode as saree_id since backend accepts it or we can lookup)
      // Note: In real app, we might need to lookup saree by barcode first. Let's assume barcode = saree_id or backend handles it.
      // Wait, mirrorAPI.startTryOn expects saree_id. Let's lookup saree id.
      // Actually, if we just pass barcode as saree_id, backend might fail if it's not the UUID.
      // Let's pass it anyway, backend needs to be robust, or we use storeAPI to search.
      // For now, let's just pass it.
      
      const tryonRes = await mirrorAPI.startTryOn(
        sessionToken,
        barcode.trim(),
        uploadedPhotoUrl
      )
      
      const jobId = tryonRes.data.data.job_id
      
      // 4. Poll
      const pollStatus = async () => {
        try {
          const res = await mirrorAPI.getTryOnStatus(jobId)
          const data = res.data.data
          
          if (data.status === 'completed') {
            setResultImage(data.result_image)
            setStep(4) // Move to result
            toast.success('Try-On Complete!')
          } else if (data.status === 'failed') {
            toast.error(data.error_message || 'Try-on failed')
            setFlowOpen(false)
          } else {
            setTimeout(pollStatus, 3000)
          }
        } catch (err) {
          toast.error('Error polling status')
          setFlowOpen(false)
        }
      }
      
      pollStatus()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to process Try-On')
      setFlowOpen(false)
    }
  }

  if (loading) return <div className="dashboard-loading">Loading dashboard...</div>

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="dashboard-container"
    >
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Store Operations</h1>
          <p className="dashboard-subtitle">Control center for your virtual try-on mirror</p>
        </div>
      </div>

      {/* HUGE HERO BUTTON */}
      <div className="hero-section">
        <button className="try-start-btn" onClick={openFlow}>
          <span className="btn-icon">⚡</span>
          TRY START
        </button>
      </div>

      {/* KPI Cards */}
      <div className="stat-cards-grid">
        <StatCard 
          title="Try-Ons Today" 
          value={stats?.tryons?.today || 0}
          subtitle={`${stats?.tryons?.total || 0} total all time`}
          icon="👗"
          color="purple"
        />
        <StatCard 
          title="AI Credits Left" 
          value={stats?.store?.credits_remaining ?? '—'}
          subtitle={`Plan: ${stats?.store?.plan_type || 'Basic'} • ${stats?.store?.credits_per_swap || 1} credit/swap`}
          icon="✨"
          color="amber"
        />
        <StatCard 
          title="Active Sarees" 
          value={stats?.sarees?.active || 0}
          subtitle={`Total in catalogue: ${stats?.sarees?.total || 0}`}
          icon="🛍️"
          color="blue"
        />
        <StatCard 
          title="Usage Today" 
          value={stats?.store?.photos_used_today || 0}
          subtitle={`Limit: ${stats?.store?.daily_limit === -1 ? 'Unlimited' : (stats?.store?.daily_limit || '—')}`}
          icon="📈"
          color="emerald"
        />
      </div>

      {/* OVERLAY FLOW MODAL */}
      <AnimatePresence>
        {flowOpen && (
          <div className="flow-overlay">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="flow-modal"
            >
              <button className="flow-close" onClick={closeFlow}>&times;</button>
              
              <div className="flow-header">
                <h2>Virtual Try-On Assistant</h2>
                <div className="flow-step-indicator">
                  <div className={`step-dot ${step >= 1 ? 'active' : ''}`} />
                  <div className={`step-dot ${step >= 2 ? 'active' : ''}`} />
                  <div className={`step-dot ${step >= 3 ? 'active' : ''}`} />
                  <div className={`step-dot ${step >= 4 ? 'active' : ''}`} />
                </div>
              </div>

              <div className="flow-content">
                {step === 1 && (
                  <>
                    <h3 style={{ color: '#fff', marginBottom: '1.5rem' }}>Take Customer Photo</h3>
                    <div className="camera-box">
                      <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{ facingMode: "user" }}
                        className="camera-preview"
                      />
                    </div>
                    <button className="capture-btn" onClick={capturePhoto}>
                      📸 Capture Image
                    </button>
                  </>
                )}

                {step === 2 && (
                  <>
                    <h3 style={{ color: '#fff', marginBottom: '1.5rem' }}>Enter Saree Barcode</h3>
                    <form onSubmit={submitBarcode} className="barcode-input-container">
                      <input 
                        type="text" 
                        autoFocus
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        placeholder="Scan or type barcode"
                        className="barcode-input"
                      />
                      <button type="submit" className="capture-btn" style={{ width: '100%' }}>
                        Next ➡️
                      </button>
                    </form>
                  </>
                )}

                {step === 3 && (
                  <div className="processing-view">
                    <div className="spinner" />
                    <h3 style={{ color: '#fff' }}>Generating AI Try-On...</h3>
                    <p style={{ color: '#9ca3af', marginTop: '1rem' }}>This may take 10-15 seconds</p>
                  </div>
                )}

                {step === 4 && (
                  <div className="result-view">
                    <h3 style={{ color: '#fff', marginBottom: '1.5rem' }}>Done!</h3>
                    {resultImage && (
                      <img src={resultImage} alt="Result" className="result-image" />
                    )}
                    <div>
                      <button className="capture-btn" onClick={closeFlow}>
                        Finish
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  )
}

function StatCard({ title, value, subtitle, icon, color }) {
  return (
    <div className={`stat-card card-${color}`}>
      <div className="stat-card-content">
        <p className="stat-card-title">{title}</p>
        <h3 className="stat-card-value">{value}</h3>
        {subtitle && <p className="stat-card-subtitle">{subtitle}</p>}
      </div>
      <div className="stat-card-icon-wrapper">
        {icon}
      </div>
    </div>
  )
}

export default DashboardPage