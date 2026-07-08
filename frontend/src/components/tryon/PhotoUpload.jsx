import { useState, useRef } from 'react'
import { FiUpload, FiX, FiRotateCcw } from 'react-icons/fi'
import { validateImage } from '../../utils/validators'
import './PhotoUpload.css'

function PhotoUpload({ onPhotoSelect, selectedPhoto }) {
  const fileInputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const handleFileSelect = (file) => {
    const validationError = validateImage(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError('')

    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target.result)
    }
    reader.readAsDataURL(file)

    onPhotoSelect(file)
  }

  const handleInputChange = (e) => {
    const file = e.target.files[0]
    if (file) handleFileSelect(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleRemove = () => {
    setPreview(null)
    setError('')
    onPhotoSelect(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="photo-upload">
      {!preview ? (
        <div
          className={`upload-dropzone ${dragOver ? 'drag-over' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="upload-icon"></div>
          <h3>Upload Your Photo</h3>
          <p>Click to browse or drag & drop</p>
          <p className="upload-hint">
            JPEG, PNG or WebP • Max 10MB
          </p>
          <p className="upload-tip">
             Use a full-body photo with good lighting for best results
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleInputChange}
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        <div className="upload-preview">
          <div className="preview-image-wrapper">
            <img
              src={preview}
              alt="Your photo"
              className="preview-image"
            />
            <button
              className="preview-remove"
              onClick={handleRemove}
            >
              <FiX />
            </button>
          </div>
          <div className="preview-info">
            <p className="preview-text">✓ Photo selected</p>
            <button
              className="preview-change"
              onClick={() => fileInputRef.current?.click()}
            >
              <FiRotateCcw /> Change Photo
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleInputChange}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      )}

      {error && <p className="upload-error">{error}</p>}
    </div>
  )
}

export default PhotoUpload