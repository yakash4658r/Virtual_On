import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import superadminAPI from '../../api/superadminAPI'
import toast from 'react-hot-toast'
import '../../layouts/SuperAdminLayout.css'

function CreateEditStore() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    store_name: '',
    store_code: '',
    owner_email: '',
    address: '',
    phone: '',
    subscription_plan: 'starter',
    ai_credits_remaining: 100,
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'ai_credits_remaining' ? parseInt(value) || 0 : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.store_name.trim()) {
      toast.error('Store name is required')
      return
    }
    if (!formData.store_code.trim()) {
      toast.error('Store code is required')
      return
    }
    if (!formData.owner_email.trim()) {
      toast.error('Owner email is required')
      return
    }

    setLoading(true)
    try {
      await superadminAPI.createStore(formData)
      toast.success('Store created successfully!')
      navigate('/superadmin/stores')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to create store'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="sa-page">
      <div className="sa-page-header">
        <h1 className="sa-page-title">Create New Store</h1>
        <p className="sa-page-subtitle">Register a new tenant store on the platform</p>
      </div>

      <div className="sa-table-wrap" style={{ padding: '28px' }}>
        <form onSubmit={handleSubmit}>
          <div className="sa-form-row">
            <div className="sa-form-group">
              <label className="sa-form-label">Store Name *</label>
              <input
                type="text"
                name="store_name"
                className="sa-form-input"
                placeholder="e.g., Lakshmi Silks"
                value={formData.store_name}
                onChange={handleChange}
              />
            </div>
            <div className="sa-form-group">
              <label className="sa-form-label">Store Code * (unique, short)</label>
              <input
                type="text"
                name="store_code"
                className="sa-form-input"
                placeholder="e.g., LKSHMI"
                value={formData.store_code}
                onChange={handleChange}
                maxLength={10}
                style={{ textTransform: 'uppercase' }}
              />
            </div>
          </div>

          <div className="sa-form-group">
            <label className="sa-form-label">Owner Email *</label>
            <input
              type="email"
              name="owner_email"
              className="sa-form-input"
              placeholder="owner@store.com"
              value={formData.owner_email}
              onChange={handleChange}
            />
          </div>

          <div className="sa-form-row">
            <div className="sa-form-group">
              <label className="sa-form-label">Address</label>
              <input
                type="text"
                name="address"
                className="sa-form-input"
                placeholder="123 Silk Street, Chennai"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            <div className="sa-form-group">
              <label className="sa-form-label">Phone</label>
              <input
                type="text"
                name="phone"
                className="sa-form-input"
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="sa-form-row">
            <div className="sa-form-group">
              <label className="sa-form-label">Subscription Plan</label>
              <select
                name="subscription_plan"
                className="sa-form-select"
                value={formData.subscription_plan}
                onChange={handleChange}
              >
                <option value="starter">Starter</option>
                <option value="professional">Professional</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div className="sa-form-group">
              <label className="sa-form-label">AI Credits</label>
              <input
                type="number"
                name="ai_credits_remaining"
                className="sa-form-input"
                value={formData.ai_credits_remaining}
                onChange={handleChange}
                min={0}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button type="submit" className="sa-btn primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Store'}
            </button>
            <button
              type="button"
              className="sa-btn outline"
              onClick={() => navigate('/superadmin/stores')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateEditStore
