import { useState, useEffect } from 'react'
import { FiSave, FiUser, FiHome, FiShield, FiBell } from 'react-icons/fi'
import tryonAPI from '../../api/tryonAPI'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/common/Button'
import { PageLoader } from '../../components/common/Loader'
import toast from 'react-hot-toast'
import './AdminPages.css'

function StoreSettingsPage() {
  const { user, updateProfile } = useAuth()
  const [store, setStore] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('store')

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  })

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  })

  useEffect(() => {
    loadStore()
  }, [])

  const loadStore = async () => {
    try {
      const res = await tryonAPI.getStoreSettings()
      const storeData = res.data.data
      setStore(storeData)
      setFormData({
        name: storeData.name || '',
        description: storeData.description || '',
        phone: storeData.phone || '',
        email: storeData.email || '',
        address: storeData.address || '',
        city: storeData.city || '',
        state: storeData.state || '',
        pincode: storeData.pincode || '',
      })
    } catch (error) {
      console.error('Failed to load store')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveStore = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await tryonAPI.updateStoreSettings(formData)
      toast.success('Store settings updated!')
    } catch (error) {
      toast.error('Failed to update')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    await updateProfile(profileData)
  }

  if (loading) return <PageLoader text="Loading settings..." />

  const tabs = [
    { id: 'store', label: 'Store Info', icon: <FiHome /> },
    { id: 'profile', label: 'Profile', icon: <FiUser /> },
    { id: 'security', label: 'Security', icon: <FiShield /> },
    { id: 'notifications', label: 'Notifications', icon: <FiBell /> },
  ]

  return (
    <div className="admin-page">
      <h1 className="admin-title">Settings</h1>

      {/* Tabs */}
      <div className="settings-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Store Info Tab */}
      {activeTab === 'store' && (
        <div className="settings-section">
          <h2 className="settings-section-title">Store Information</h2>
          <form onSubmit={handleSaveStore}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Store Name</label>
                <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Store Email</label>
                <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input type="tel" name="phone" className="form-input" value={formData.phone} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input type="text" name="city" className="form-input" value={formData.city} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">State</label>
                <input type="text" name="state" className="form-input" value={formData.state} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Pincode</label>
                <input type="text" name="pincode" className="form-input" value={formData.pincode} onChange={handleChange} maxLength={6} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea name="address" className="form-textarea" rows="2" value={formData.address} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea name="description" className="form-textarea" rows="3" value={formData.description} onChange={handleChange} />
            </div>
            <Button type="submit" variant="primary" loading={saving} icon={<FiSave />}>
              Save Store Settings
            </Button>
          </form>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="settings-section">
          <h2 className="settings-section-title">Your Profile</h2>
          <form onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
            </div>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input type="text" name="name" className="form-input" value={profileData.name} onChange={handleProfileChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input type="tel" name="phone" className="form-input" value={profileData.phone} onChange={handleProfileChange} />
            </div>
            <Button type="submit" variant="primary" icon={<FiSave />}>Update Profile</Button>
          </form>

          <div className="settings-info-card" style={{ marginTop: '24px' }}>
            <h3>Account Info</h3>
            <p><strong>Role:</strong> {user?.role}</p>
            <p><strong>Account ID:</strong> {user?.id?.substring(0, 8)}...</p>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="settings-section">
          <h2 className="settings-section-title">Security</h2>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input type="password" className="form-input" placeholder="Enter current password" />
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input type="password" className="form-input" placeholder="Enter new password" />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input type="password" className="form-input" placeholder="Confirm new password" />
          </div>
          <Button variant="primary" icon={<FiShield />}>Update Password</Button>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="settings-section">
          <h2 className="settings-section-title">Notification Preferences</h2>
          <div className="notification-options">
            <label className="notification-option">
              <div className="notification-option-info">
                <p className="notification-option-title">Email Notifications</p>
                <p className="notification-option-desc">Receive email alerts for new orders and try-on sessions</p>
              </div>
              <input type="checkbox" defaultChecked className="toggle-checkbox" />
            </label>
            <label className="notification-option">
              <div className="notification-option-info">
                <p className="notification-option-title">Low Stock Alerts</p>
                <p className="notification-option-desc">Get notified when products are running low</p>
              </div>
              <input type="checkbox" defaultChecked className="toggle-checkbox" />
            </label>
            <label className="notification-option">
              <div className="notification-option-info">
                <p className="notification-option-title">Weekly Reports</p>
                <p className="notification-option-desc">Receive a weekly summary of sales and analytics</p>
              </div>
              <input type="checkbox" className="toggle-checkbox" />
            </label>
            <label className="notification-option">
              <div className="notification-option-info">
                <p className="notification-option-title">System Updates</p>
                <p className="notification-option-desc">Get notified about system maintenance and updates</p>
              </div>
              <input type="checkbox" defaultChecked className="toggle-checkbox" />
            </label>
          </div>
          <div style={{ marginTop: '20px' }}>
            <Button variant="primary" icon={<FiSave />}>Save Preferences</Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default StoreSettingsPage