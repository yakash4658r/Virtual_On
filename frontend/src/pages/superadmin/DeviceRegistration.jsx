import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import superadminAPI from '../../api/superadminAPI'
import toast from 'react-hot-toast'
import '../admin/DeviceManagePage.css' // Reuse the beautiful card styles

function DeviceRegistration() {
  const [devices, setDevices] = useState([])
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  
  const [formData, setFormData] = useState({
    storeId: '',
    deviceId: '',
    deviceName: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [devicesRes, storesRes] = await Promise.all([
        superadminAPI.getAllDevices(),
        superadminAPI.getStores()
      ])
      setDevices(devicesRes.data.data)
      setStores(storesRes.data.data)
    } catch (err) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.storeId || !formData.deviceId) {
      toast.error('Store and Device ID are required')
      return
    }

    try {
      await superadminAPI.assignDevice(formData.storeId, formData.deviceId, formData.deviceName || 'Mirror')
      toast.success('Device registered successfully')
      setShowForm(false)
      setFormData({ storeId: '', deviceId: '', deviceName: '' })
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to register device')
    }
  }

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Never'
    const diff = new Date() - new Date(dateString + 'Z')
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  const isOnline = (lastSeen) => {
    if (!lastSeen) return false
    const diff = new Date() - new Date(lastSeen + 'Z')
    return diff < 120000 // 2 minutes
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="device-page-container"
    >
      <div className="device-page-header">
        <div>
          <h1 className="device-page-title">Smart Mirrors Overview</h1>
          <p className="device-page-subtitle">Manage kiosk devices across all tenant stores</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="device-btn-primary"
        >
          {showForm ? 'Cancel' : '+ Register Device'}
        </button>
      </div>

      {showForm && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="device-form-card"
        >
          <h2 className="device-form-title">Register New Device</h2>
          <form onSubmit={handleSubmit} className="device-form-grid">
            <div className="device-form-group">
              <label className="device-form-label">Assign to Store *</label>
              <select
                required
                className="device-form-input"
                value={formData.storeId}
                onChange={e => setFormData({...formData, storeId: e.target.value})}
              >
                <option value="">Select a store</option>
                {stores.filter(s => s.is_active).map(s => (
                  <option key={s.id} value={s.id}>{s.store_name} ({s.store_code})</option>
                ))}
              </select>
            </div>
            <div className="device-form-group">
              <label className="device-form-label">Device ID (Unique Code) *</label>
              <input
                required
                type="text"
                placeholder="e.g. MIRROR-01"
                className="device-form-input"
                value={formData.deviceId}
                onChange={e => setFormData({...formData, deviceId: e.target.value.toUpperCase()})}
              />
            </div>
            <div className="device-form-group">
              <label className="device-form-label">Device Name</label>
              <input
                type="text"
                placeholder="e.g. Main Entrance Mirror"
                className="device-form-input"
                value={formData.deviceName}
                onChange={e => setFormData({...formData, deviceName: e.target.value})}
              />
            </div>
            <div className="device-form-actions">
              <button type="submit" className="device-btn-primary">
                Register Device
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {loading ? (
        <div className="device-loading">Loading devices...</div>
      ) : (
        <div className="device-grid">
          {devices.map(device => {
            const online = isOnline(device.last_seen)
            return (
              <motion.div 
                whileHover={{ y: -5 }}
                key={device.id} 
                className="device-card"
              >
                <div className={`device-status-bar ${online ? 'bar-online' : 'bar-offline'}`} />
                
                <div className="device-card-header">
                  <h3 className="device-card-title">{device.device_name || 'Unnamed Device'}</h3>
                  <span className={`device-status-badge ${online ? 'badge-online' : 'badge-offline'}`}>
                    {online ? 'Online' : 'Offline'}
                  </span>
                </div>
                
                <div className="device-info-list">
                  <p className="device-info-row">
                    <span>Store:</span>
                    <span className="device-info-value" style={{fontWeight: 'bold', color: '#8b5cf6'}}>{device.store_name}</span>
                  </p>
                  <p className="device-info-row">
                    <span>Device ID:</span>
                    <span className="device-info-value mono">{device.device_id}</span>
                  </p>
                  <p className="device-info-row">
                    <span>Last Seen:</span>
                    <span className="device-info-value">{getTimeAgo(device.last_seen)}</span>
                  </p>
                </div>
                
                <div className="device-card-footer">
                  <a 
                    href={`/mirror/${device.device_id}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="device-link"
                  >
                    Open Kiosk Mode ↗
                  </a>
                </div>
              </motion.div>
            )
          })}
          
          {devices.length === 0 && !showForm && (
            <div className="device-empty-state">
              <h3 className="device-empty-title">No devices registered</h3>
              <p className="device-empty-subtitle">Register a device to assign it to a store.</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

export default DeviceRegistration
