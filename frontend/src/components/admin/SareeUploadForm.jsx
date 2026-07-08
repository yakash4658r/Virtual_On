import { useState, useEffect } from 'react'
import productAPI from '../../api/productAPI'
import ImageUploader from './ImageUploader'
import Button from '../common/Button'
import { FABRIC_OPTIONS, OCCASION_OPTIONS } from '../../utils/constants'
import toast from 'react-hot-toast'
import './SareeUploadForm.css'

function SareeUploadForm({ onSuccess, editData = null }) {
  const isEdit = !!editData

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: editData?.name || '',
    category_id: editData?.category?.id || '',
    description: editData?.description || '',
    price: editData?.price || '',
    color: editData?.color || '',
    fabric: editData?.fabric || 'silk',
    occasion: editData?.occasion || 'casual',
    stock_quantity: editData?.stock_quantity || 0,
    in_stock: editData?.in_stock !== undefined ? editData.in_stock : true,
    is_featured: editData?.is_featured || false,
  })

  const [images, setImages] = useState({
    image_front: null,
    image_back: null,
    image_closeup: null,
    image_pallu: null,
    tryon_image: null,
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const res = await productAPI.getCategories()
      setCategories(res.data.data)
    } catch (error) {
      console.error('Failed to load categories')
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleImageChange = (name, file) => {
    setImages((prev) => ({ ...prev, [name]: file }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.category_id) newErrors.category_id = 'Category is required'
    if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required'
    if (!formData.color.trim()) newErrors.color = 'Color is required'

    if (!isEdit) {
      if (!images.image_front) newErrors.image_front = 'Front image is required'
      if (!images.tryon_image) newErrors.tryon_image = 'Try-on image is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)

    try {
      const submitData = new FormData()

      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value)
      })

      Object.entries(images).forEach(([key, file]) => {
        if (file) submitData.append(key, file)
      })

      let response
      if (isEdit) {
        response = await productAPI.adminUpdate(editData.id, submitData)
      } else {
        response = await productAPI.adminCreate(submitData)
      }

      toast.success(
        isEdit ? 'Saree updated successfully!' : 'Saree added with barcode generated!'
      )

      onSuccess?.(response.data.data)

    } catch (error) {
      const message = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join(', ')
        : error.response?.data?.message || 'Failed to save saree'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="saree-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h3 className="form-section-title">Basic Details</h3>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Saree Name *</label>
            <input
              type="text"
              name="name"
              className={`form-input ${errors.name ? 'input-error' : ''}`}
              placeholder="e.g., Royal Red Kanjivaram"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Category *</label>
            <select
              name="category_id"
              className={`form-select ${errors.category_id ? 'input-error' : ''}`}
              value={formData.category_id}
              onChange={handleChange}
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {errors.category_id && <p className="form-error">{errors.category_id}</p>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Price (₹) *</label>
            <input
              type="number"
              name="price"
              className={`form-input ${errors.price ? 'input-error' : ''}`}
              placeholder="e.g., 15000"
              value={formData.price}
              onChange={handleChange}
              min="0"
            />
            {errors.price && <p className="form-error">{errors.price}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Color *</label>
            <input
              type="text"
              name="color"
              className={`form-input ${errors.color ? 'input-error' : ''}`}
              placeholder="e.g., Red & Gold"
              value={formData.color}
              onChange={handleChange}
            />
            {errors.color && <p className="form-error">{errors.color}</p>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Fabric</label>
            <select name="fabric" className="form-select" value={formData.fabric} onChange={handleChange}>
              {FABRIC_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Occasion</label>
            <select name="occasion" className="form-select" value={formData.occasion} onChange={handleChange}>
              {OCCASION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Stock Quantity</label>
            <input
              type="number"
              name="stock_quantity"
              className="form-input"
              value={formData.stock_quantity}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div className="form-group" style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', paddingBottom: '12px' }}>
            <label className="checkbox-label">
              <input type="checkbox" name="in_stock" checked={formData.in_stock} onChange={handleChange} />
              <span>In Stock</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} />
              <span>Featured</span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            className="form-textarea"
            rows="3"
            placeholder="Beautiful handwoven silk saree with rich zari work..."
            value={formData.description}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">
          Saree Images
          {!isEdit && <span className="form-section-hint">* Front and Try-On images are required</span>}
        </h3>

        <div className="images-grid">
          <ImageUploader
            label="Front View"
            name="image_front"
            required={!isEdit}
            onChange={handleImageChange}
            currentImage={editData?.image_front ? editData.image_front : null}
          />
          <ImageUploader
            label="Back View"
            name="image_back"
            onChange={handleImageChange}
            currentImage={editData?.image_back ? editData.image_back : null}
          />
          <ImageUploader
            label="Close-up"
            name="image_closeup"
            onChange={handleImageChange}
            currentImage={editData?.image_closeup ? editData.image_closeup : null}
          />
          <ImageUploader
            label="Pallu Detail"
            name="image_pallu"
            onChange={handleImageChange}
            currentImage={editData?.image_pallu ? editData.image_pallu : null}
          />
          <ImageUploader
            label="Try-On Image (for AI)"
            name="tryon_image"
            required={!isEdit}
            onChange={handleImageChange}
            currentImage={editData?.tryon_image ? editData.tryon_image : null}
          />
        </div>

        {(errors.image_front || errors.tryon_image) && (
          <p className="form-error" style={{ marginTop: '10px' }}>
            {errors.image_front || errors.tryon_image}
          </p>
        )}

        <div className="tryon-image-tip">
          <p> <strong>Try-On Image Tip:</strong> Use a flat-lay, mannequin, or model photo of the saree. Clean background and full saree visibility gives best AI results.</p>
        </div>
      </div>

      <div className="form-actions">
        <Button type="submit" variant="success" size="large" loading={loading}>
          {isEdit ? '✓ Update Saree' : '+ Add Saree & Generate Barcode'}
        </Button>
      </div>
    </form>
  )
}

export default SareeUploadForm