import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import deviceAPI from '../../api/deviceAPI'

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
      className="p-6 max-w-6xl mx-auto"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Smart Mirrors</h1>
          <p className="text-gray-500 mt-1">Manage kiosk devices in your store</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          {showForm ? 'Cancel' : '+ Register Device'}
        </button>
      </div>

      {showForm && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8"
        >
          <h2 className="text-xl font-semibold mb-4">Register New Device</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Device ID (Unique Code)</label>
              <input
                required
                type="text"
                placeholder="e.g. MIRROR-FRONT-01"
                className="w-full border-gray-300 rounded-lg p-3 border focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.device_id}
                onChange={e => setFormData({...formData, device_id: e.target.value.toUpperCase()})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Device Name</label>
              <input
                required
                type="text"
                placeholder="e.g. Main Entrance Mirror"
                className="w-full border-gray-300 rounded-lg p-3 border focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.device_name}
                onChange={e => setFormData({...formData, device_name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location in Store</label>
              <input
                type="text"
                placeholder="e.g. Ground Floor, Left Wing"
                className="w-full border-gray-300 rounded-lg p-3 border focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
              />
            </div>
            <div className="md:col-span-3 flex justify-end">
              <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium">
                Register
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {loading ? (
        <div className="text-center py-12">Loading devices...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map(device => {
            const online = isOnline(device.last_seen)
            return (
              <motion.div 
                whileHover={{ y: -5 }}
                key={device.id} 
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden"
              >
                <div className={`absolute top-0 left-0 w-full h-2 ${online ? 'bg-green-500' : 'bg-gray-300'}`} />
                
                <div className="flex justify-between items-start mb-4 mt-2">
                  <h3 className="text-xl font-bold text-gray-800">{device.device_name}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${online ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {online ? 'Online' : 'Offline'}
                  </span>
                </div>
                
                <div className="space-y-3 text-sm text-gray-600">
                  <p className="flex justify-between">
                    <span>Device ID:</span>
                    <span className="font-mono font-medium text-gray-900">{device.device_id}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Location:</span>
                    <span className="font-medium text-gray-900">{device.location || 'N/A'}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Last Seen:</span>
                    <span className="font-medium text-gray-900">{getTimeAgo(device.last_seen)}</span>
                  </p>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
                  <a 
                    href={`/mirror/${device.device_id}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center gap-1"
                  >
                    Open Kiosk Mode ↗
                  </a>
                </div>
              </motion.div>
            )
          })}
          
          {devices.length === 0 && !showForm && (
            <div className="col-span-full text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">No devices registered</h3>
              <p className="text-gray-500 mt-1">Register a device to start using the smart mirror app.</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

export default DeviceManagePage
