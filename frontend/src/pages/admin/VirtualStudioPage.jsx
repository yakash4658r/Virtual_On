import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import productAPI from '../../api/productAPI'
import mirrorAPI from '../../api/mirrorAPI'
import toast from 'react-hot-toast'
import './VirtualStudioPage.css'

function VirtualStudioPage() {
  const [sarees, setSarees] = useState([])
  const [selectedSaree, setSelectedSaree] = useState(null)
  
  const [photoBlob, setPhotoBlob] = useState(null)
  const [photoUrl, setPhotoUrl] = useState(null)
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [resultImage, setResultImage] = useState(null)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    fetchSarees()
  }, [])

  const fetchSarees = async () => {
    try {
      const res = await productAPI.getProducts()
      setSarees(res.data.data)
    } catch (err) {
      toast.error('Failed to load catalog')
    }
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPhotoBlob(file)
      setPhotoUrl(URL.createObjectURL(file))
      setResultImage(null) // Reset result on new photo
    }
  }

  const generateTryOn = async () => {
    if (!photoBlob || !selectedSaree) {
      toast.error('Please upload a photo and select a saree')
      return
    }

    setIsProcessing(true)
    setResultImage(null)
    setStatus('Uploading photo...')

    try {
      // 1. Generate fake session token
      const sessionToken = Math.random().toString(36).substring(2, 15)

      // 2. Upload photo
      const uploadRes = await mirrorAPI.uploadPhoto(sessionToken, photoBlob)
      const uploadedPhotoUrl = uploadRes.data.data.photo_url

      setStatus('Processing Try-On (Credits will be deducted)...')

      // 3. Start Try-On
      const tryonRes = await mirrorAPI.startTryOn(
        sessionToken,
        selectedSaree.id,
        uploadedPhotoUrl
      )
      
      const jobId = tryonRes.data.data.job_id
      
      // 4. Poll for status
      const pollStatus = async () => {
        try {
          const res = await mirrorAPI.getTryOnStatus(jobId)
          const data = res.data.data
          
          if (data.status === 'completed') {
            setResultImage(data.result_image)
            setIsProcessing(false)
            setStatus(null)
            toast.success('Try-On Complete!')
          } else if (data.status === 'failed') {
            setIsProcessing(false)
            setStatus(null)
            toast.error(data.error_message || 'Try-on failed')
          } else {
            setTimeout(pollStatus, 3000)
          }
        } catch (err) {
          setIsProcessing(false)
          setStatus(null)
          toast.error('Error polling status')
        }
      }
      
      pollStatus()

    } catch (err) {
      setIsProcessing(false)
      setStatus(null)
      toast.error(err.response?.data?.detail || 'Failed to start try-on')
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="studio-container"
    >
      <div className="studio-header">
        <div>
          <h1 className="studio-title">Virtual Studio</h1>
          <p className="studio-subtitle">Manually process a virtual try-on for a customer</p>
        </div>
      </div>

      <div className="studio-layout">
        
        {/* Left Side: Customer Photo */}
        <div className="studio-card">
          <h2 className="studio-card-title">1. Customer Photo</h2>
          
          <div className="photo-upload-area">
            {photoUrl ? (
              <div className="photo-preview-container">
                <img src={photoUrl} alt="Customer" className="photo-preview" />
                <label className="photo-upload-btn-secondary">
                  Change Photo
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} hidden />
                </label>
              </div>
            ) : (
              <label className="photo-upload-box">
                <span className="upload-icon">📸</span>
                <span className="upload-text">Upload or Take Photo</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} hidden />
              </label>
            )}
          </div>
        </div>

        {/* Right Side: Catalog */}
        <div className="studio-card">
          <h2 className="studio-card-title">2. Select Saree</h2>
          <div className="catalog-grid">
            {sarees.map(saree => (
              <div 
                key={saree.id} 
                className={`catalog-item ${selectedSaree?.id === saree.id ? 'selected' : ''}`}
                onClick={() => setSelectedSaree(saree)}
              >
                <img src={saree.image_url} alt={saree.name} className="catalog-image" />
                <p className="catalog-name">{saree.name}</p>
                <p className="catalog-code">{saree.barcode_id}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Try-On Button & Result */}
      <div className="studio-action-area">
        <button 
          className={`studio-generate-btn ${isProcessing ? 'processing' : ''}`}
          onClick={generateTryOn}
          disabled={isProcessing || !photoUrl || !selectedSaree}
        >
          {isProcessing ? 'Processing AI...' : 'Generate Try-On 🪄'}
        </button>

        {status && (
          <p className="studio-status-text">{status}</p>
        )}

        {resultImage && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="studio-result-card"
          >
            <h2 className="studio-card-title">Result</h2>
            <img src={resultImage} alt="Try-On Result" className="studio-result-image" />
          </motion.div>
        )}
      </div>

    </motion.div>
  )
}

export default VirtualStudioPage
