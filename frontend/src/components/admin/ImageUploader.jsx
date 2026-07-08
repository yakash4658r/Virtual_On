import { useState, useRef } from 'react'
import { FiUpload, FiX } from 'react-icons/fi'
import './ImageUploader.css'

function ImageUploader({ label, name, required = false, onChange, currentImage = null }) {
  const inputRef = useRef(null)
  const [preview, setPreview] = useState(currentImage)

  const handleChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target.result)
    reader.readAsDataURL(file)

    onChange(name, file)
  }

  const handleRemove = () => {
    setPreview(null)
    onChange(name, null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="image-uploader">
      <label className="uploader-label">
        {label} {required && <span className="required">*</span>}
      </label>

      {!preview ? (
        <div
          className="uploader-dropzone"
          onClick={() => inputRef.current?.click()}
        >
          <FiUpload className="uploader-icon" />
          <p>Click to upload</p>
        </div>
      ) : (
        <div className="uploader-preview">
          <img src={preview} alt={label} className="uploader-image" />
          <button className="uploader-remove" onClick={handleRemove}>
            <FiX />
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        style={{ display: 'none' }}
      />
    </div>
  )
}

export default ImageUploader