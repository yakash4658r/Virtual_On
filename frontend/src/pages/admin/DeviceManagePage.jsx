import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import deviceAPI from '../../api/deviceAPI'
import './DeviceManagePage.css'

function DeviceManagePage() {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  
  const [formData, setFormData] = useState({
    device_id: '',
    device_name: '',
    location: ''
  })

  useEffect(() => {
    fetchDevices()
  }, [])

  const fetchDevices = async () => {
    try {
      const res = await deviceAPI.getDevices()
      setDevices(res.data.data)
    } catch (err) {
      toast.error('Failed to load devices')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await deviceAPI.registerDevice(formData)
      toast.success('Device registered successfully')
      setShowForm(false)
      setFormData({ device_id: '', device_name: '', location: '' })
      fetchDevices()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to register device')
    }
  }

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Never'
    const diff = new Date() - new Date(dateString + 'Z') // UTC
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
    return diff < 120000 // 2 minutes (heartbeat is 30s)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="device-page-container"
    >
      <div className="device-page-header">
        <div>
          <h1 className="device-page-title">Smart Mirrors</h1>
          <p className="device-page-subtitle">Manage kiosk devices in your store</p>
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
              <label className="device-form-label">Device ID (Unique Code)</label>
              <input
                required
                type="text"
                placeholder="e.g. MIRROR-FRONT-01"
                className="device-form-input"
                value={formData.device_id}
                onChange={e => setFormData({...formData, device_id: e.target.value.toUpperCase()})}
              />
            </div>
            <div className="device-form-group">
              <label className="device-form-label">Device Name</label>
              <input
                required
                type="text"
                placeholder="e.g. Main Entrance Mirror"
                className="device-form-input"
                value={formData.device_name}
                onChange={e => setFormData({...formData, device_name: e.target.value})}
              />
            </div>
            <div className="device-form-group">
              <label className="device-form-label">Location in Store</label>
              <input
                type="text"
                placeholder="e.g. Ground Floor, Left Wing"
                className="device-form-input"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
              />
            </div>
            <div className="device-form-actions">
              <button type="submit" className="device-btn-primary">
                Register
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
                  <h3 className="device-card-title">{device.device_name}</h3>
                  <span className={`device-status-badge ${online ? 'badge-online' : 'badge-offline'}`}>
                    {online ? 'Online' : 'Offline'}
                  </span>
                </div>
                
                <div className="device-info-list">
                  <p className="device-info-row">
                    <span>Device ID:</span>
                    <span className="device-info-value mono">{device.device_id}</span>
                  </p>
                  <p className="device-info-row">
                    <span>Location:</span>
                    <span className="device-info-value">{device.location || 'N/A'}</span>
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
              <p className="device-empty-subtitle">Register a device to start using the smart mirror app.</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

export default DeviceManagePage
