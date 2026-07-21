import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import superadminAPI from '../../api/superadminAPI'
import toast from 'react-hot-toast'
import '../../layouts/SuperAdminLayout.css'

function CreateEditStore() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(isEdit)
  const [formData, setFormData] = useState({
    store_name: '',
    owner_name: '',
    owner_email: '',
    owner_phone: '',
    address: '',
    plan_type: 'starter',
    initial_credits: 100,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'initial_credits' ? parseInt(value) || 0 : value),
    }))
  }

  useEffect(() => {
    if (isEdit) {
      loadStore()
    }
  }, [id])

  const loadStore = async () => {
    try {
      const res = await superadminAPI.getStoreById(id)
      const data = res.data.data
      setFormData({
        store_name: data.store_name || '',
        owner_name: data.owner_name || '',
        owner_email: data.owner_email || '',
        owner_phone: data.owner_phone || '',
        address: data.address || '',
        plan_type: data.plan_type || 'starter',
        initial_credits: data.credits_remaining || 0,
        is_active: data.is_active !== false,
      })
    } catch (err) {
      toast.error('Failed to load store')
      navigate('/superadmin/stores')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.store_name.trim()) {
      toast.error('Store name is required')
      return
    }
    if (!formData.owner_email.trim()) {
      toast.error('Owner email is required')
      return
    }

    setLoading(true)
    try {
      if (isEdit) {
        const updateData = {
          store_name: formData.store_name,
          owner_name: formData.owner_name,
          owner_phone: formData.owner_phone,
          address: formData.address,
          plan_type: formData.plan_type
        }
        await superadminAPI.updateStore(id, updateData)
        toast.success('Store updated successfully!')
      } else {
        await superadminAPI.createStore(formData)
        toast.success('Store created successfully! Activation Code generated.')
      }
      navigate('/superadmin/stores')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to save store'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return <div className="sa-page"><p style={{padding: '24px'}}>Loading...</p></div>
  }

  return (
    <div className="sa-page">
      <div className="sa-page-header">
        <h1 className="sa-page-title">{isEdit ? 'Edit Store' : 'Create New Store'}</h1>
        <p className="sa-page-subtitle">{isEdit ? 'Update tenant details' : 'Register a new tenant store (Activation Code will be auto-generated)'}</p>
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
              <label className="sa-form-label">Owner Name</label>
              <input
                type="text"
                name="owner_name"
                className="sa-form-input"
                placeholder="Owner full name"
                value={formData.owner_name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="sa-form-row">
            <div className="sa-form-group">
              <label className="sa-form-label">Owner Email *</label>
              <input
                type="email"
                name="owner_email"
                className="sa-form-input"
                placeholder="owner@store.com"
                value={formData.owner_email}
                onChange={handleChange}
                disabled={isEdit}
              />
            </div>
            <div className="sa-form-group">
              <label className="sa-form-label">Phone</label>
              <input
                type="text"
                name="owner_phone"
                className="sa-form-input"
                placeholder="+91 9876543210"
                value={formData.owner_phone}
                onChange={handleChange}
              />
            </div>
          </div>

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

          <div className="sa-form-row">
            <div className="sa-form-group">
              <label className="sa-form-label">Subscription Plan</label>
              <select
                name="plan_type"
                className="sa-form-select"
                value={formData.plan_type}
                onChange={handleChange}
              >
                <option value="basic">Basic (250/day)</option>
                <option value="pro">Pro (500/day)</option>
                <option value="unlimited">Unlimited</option>
              </select>
            </div>
            
            {!isEdit && (
              <div className="sa-form-group">
                <label className="sa-form-label">Initial Credits</label>
                <input
                  type="number"
                  name="initial_credits"
                  className="sa-form-input"
                  value={formData.initial_credits}
                  onChange={handleChange}
                  min={0}
                />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button type="submit" className="sa-btn primary" disabled={loading}>
              {loading ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Store')}
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
