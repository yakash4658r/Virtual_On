import { useState, useEffect } from 'react'
import superadminAPI from '../../api/superadminAPI'
import { FiMonitor, FiPlus } from 'react-icons/fi'
import toast from 'react-hot-toast'
import '../../layouts/SuperAdminLayout.css'

function DeviceRegistration() {
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    storeId: '',
    deviceId: '',
    deviceName: '',
  })

  useEffect(() => {
    loadStores()
  }, [])

  const loadStores = async () => {
    try {
      const res = await superadminAPI.getStores()
      setStores(res.data.data)
    } catch {
      console.error('Failed to load stores')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.storeId || !form.deviceId) {
      toast.error('Store and Device ID are required')
      return
    }

    setSubmitting(true)
    try {
      await superadminAPI.assignDevice(form.storeId, form.deviceId, form.deviceName || 'Mirror')
      toast.success(`Device ${form.deviceId} assigned!`)
      setShowModal(false)
      setForm({ storeId: '', deviceId: '', deviceName: '' })
      loadStores()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to assign device')
    } finally {
      setSubmitting(false)
    }
  }

  // Flatten all devices from stores for display
  const allDevices = stores.flatMap(s =>
    Array.from({ length: s.device_count || 0 }, (_, i) => ({
      storeId: s.id,
      storeName: s.store_name,
      storeCode: s.store_code,
    }))
  )

  return (
    <div className="sa-page">
      <div className="sa-page-header">
        <h1 className="sa-page-title">Device Management</h1>
        <p className="sa-page-subtitle">Register and assign mirror kiosks to stores</p>
      </div>

      <div className="sa-stats-grid">
        <div className="sa-stat-card">
          <div className="sa-stat-icon purple"><FiMonitor /></div>
          <div>
            <div className="sa-stat-value">
              {stores.reduce((sum, s) => sum + (s.device_count || 0), 0)}
            </div>
            <div className="sa-stat-label">Total Devices</div>
          </div>
        </div>
        <div className="sa-stat-card">
          <div className="sa-stat-icon emerald"><FiMonitor /></div>
          <div>
            <div className="sa-stat-value">{stores.length}</div>
            <div className="sa-stat-label">Stores with Devices</div>
          </div>
        </div>
      </div>

      <div className="sa-table-wrap">
        <div className="sa-table-header">
          <h3 className="sa-table-title">Devices by Store</h3>
          <button className="sa-btn primary" onClick={() => setShowModal(true)}>
            <FiPlus /> Register Device
          </button>
        </div>

        {loading ? (
          <div className="sa-empty">
            <p className="sa-empty-text">Loading...</p>
          </div>
        ) : stores.length === 0 ? (
          <div className="sa-empty">
            <div className="sa-empty-icon"><FiMonitor /></div>
            <p className="sa-empty-text">No stores yet. Create a store first.</p>
          </div>
        ) : (
          <table className="sa-table">
            <thead>
              <tr>
                <th>Store</th>
                <th>Code</th>
                <th>Devices</th>
                <th>Plan</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store.id}>
                  <td><strong style={{ color: '#e5e7eb' }}>{store.store_name}</strong></td>
                  <td>
                    <code style={{ background: 'rgba(124,58,237,0.1)', padding: '3px 8px', borderRadius: '4px', color: '#a78bfa' }}>
                      {store.store_code}
                    </code>
                  </td>
                  <td>{store.device_count}</td>
                  <td>
                    <span className={`sa-badge ${store.subscription_plan}`}>
                      {store.subscription_plan}
                    </span>
                  </td>
                  <td>
                    <span className={`sa-badge ${store.is_active ? 'active' : 'inactive'}`}>
                      {store.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Register Device Modal */}
      {showModal && (
        <div className="sa-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="sa-modal-title">Register New Device</h2>
            <form onSubmit={handleSubmit}>
              <div className="sa-form-group">
                <label className="sa-form-label">Assign to Store *</label>
                <select
                  className="sa-form-select"
                  value={form.storeId}
                  onChange={(e) => setForm(prev => ({ ...prev, storeId: e.target.value }))}
                >
                  <option value="">Select a store</option>
                  {stores.filter(s => s.is_active).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.store_name} ({s.store_code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sa-form-group">
                <label className="sa-form-label">Device ID * (unique identifier)</label>
                <input
                  type="text"
                  className="sa-form-input"
                  placeholder="e.g., LKSHMI-001"
                  value={form.deviceId}
                  onChange={(e) => setForm(prev => ({ ...prev, deviceId: e.target.value.toUpperCase() }))}
                />
              </div>

              <div className="sa-form-group">
                <label className="sa-form-label">Device Name</label>
                <input
                  type="text"
                  className="sa-form-input"
                  placeholder="e.g., Main Entrance Mirror"
                  value={form.deviceName}
                  onChange={(e) => setForm(prev => ({ ...prev, deviceName: e.target.value }))}
                />
              </div>

              <div className="sa-modal-actions">
                <button type="button" className="sa-btn outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="sa-btn primary" disabled={submitting}>
                  {submitting ? 'Registering...' : 'Register Device'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default DeviceRegistration
