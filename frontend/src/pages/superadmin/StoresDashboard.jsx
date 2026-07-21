import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import superadminAPI from '../../api/superadminAPI'
import { FiShoppingBag, FiEdit2, FiXCircle, FiCheckCircle, FiPlus, FiSearch, FiDollarSign } from 'react-icons/fi'
import '../../layouts/SuperAdminLayout.css'
import toast from 'react-hot-toast'

function StoresDashboard() {
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [topUpModal, setTopUpModal] = useState({ open: false, storeId: null, storeName: '', amount: 100 })

  useEffect(() => {
    loadStores()
  }, [])

  const loadStores = async () => {
    try {
      const res = await superadminAPI.getStores()
      setStores(res.data.data)
    } catch (err) {
      console.error('Failed to load stores')
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivate = async (storeId, storeName, currentStatus) => {
    const action = currentStatus ? 'Deactivate' : 'Reactivate'
    if (!window.confirm(`${action} "${storeName}"?`)) return
    try {
      await superadminAPI.updateStore(storeId, { is_active: !currentStatus })
      toast.success(`${storeName} ${currentStatus ? 'deactivated' : 'reactivated'}`)
      loadStores()
    } catch (err) {
      toast.error(`Failed to ${action.toLowerCase()} store`)
    }
  }

  const handleTopUpSubmit = async (e) => {
    e.preventDefault()
    try {
      await superadminAPI.addCredits(topUpModal.storeId, topUpModal.amount)
      toast.success(`Added ${topUpModal.amount} credits to ${topUpModal.storeName}`)
      setTopUpModal({ open: false, storeId: null, storeName: '', amount: 100 })
      loadStores()
    } catch (err) {
      toast.error('Failed to add credits')
    }
  }

  const filtered = stores.filter(
    (s) =>
      s.store_name.toLowerCase().includes(search.toLowerCase()) ||
      s.activation_code.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="sa-page">
      <div className="sa-page-header">
        <h1 className="sa-page-title">Store Management</h1>
        <p className="sa-page-subtitle">Manage all tenant stores across the platform</p>
      </div>

      <div className="sa-stats-grid">
        <div className="sa-stat-card">
          <div className="sa-stat-icon purple"><FiShoppingBag /></div>
          <div>
            <div className="sa-stat-value">{stores.length}</div>
            <div className="sa-stat-label">Total Stores</div>
          </div>
        </div>
        <div className="sa-stat-card">
          <div className="sa-stat-icon emerald"><FiShoppingBag /></div>
          <div>
            <div className="sa-stat-value">{stores.filter(s => s.is_active).length}</div>
            <div className="sa-stat-label">Active Stores</div>
          </div>
        </div>
        <div className="sa-stat-card">
          <div className="sa-stat-icon amber"><FiShoppingBag /></div>
          <div>
            <div className="sa-stat-value">{stores.reduce((sum, s) => sum + (s.saree_count || 0), 0)}</div>
            <div className="sa-stat-label">Total Sarees</div>
          </div>
        </div>
        <div className="sa-stat-card">
          <div className="sa-stat-icon sky"><FiShoppingBag /></div>
          <div>
            <div className="sa-stat-value">{stores.reduce((sum, s) => sum + (s.device_count || 0), 0)}</div>
            <div className="sa-stat-label">Total Devices</div>
          </div>
        </div>
      </div>

      <div className="sa-table-wrap">
        <div className="sa-table-header">
          <h3 className="sa-table-title">All Stores</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <FiSearch style={{ position: 'absolute', left: '10px', top: '10px', color: '#6b7280' }} />
              <input
                type="text"
                className="sa-form-input"
                placeholder="Search stores..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '34px', width: '220px' }}
              />
            </div>
            <Link to="/superadmin/stores/new" className="sa-btn primary">
              <FiPlus /> Add Store
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="sa-empty">
            <p className="sa-empty-text">Loading stores...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="sa-empty">
            <div className="sa-empty-icon"><FiShoppingBag /></div>
            <p className="sa-empty-text">No stores found</p>
            <Link to="/superadmin/stores/new" className="sa-btn primary">
              <FiPlus /> Create First Store
            </Link>
          </div>
        ) : (
          <table className="sa-table">
            <thead>
              <tr>
                <th>Store</th>
                <th>Code</th>
                <th>Plan</th>
                <th>Sarees</th>
                <th>Devices</th>
                <th>Try-Ons</th>
                <th>Credits</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((store) => (
                <tr key={store.id}>
                  <td>
                    <div>
                      <strong style={{ color: '#e5e7eb' }}>{store.store_name}</strong>
                      <br />
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>{store.owner_email}</span>
                    </div>
                  </td>
                  <td>
                    <code style={{ background: 'rgba(124,58,237,0.1)', padding: '3px 8px', borderRadius: '4px', color: '#a78bfa' }}>
                      {store.activation_code}
                    </code>
                  </td>
                  <td>
                    <span className={`sa-badge ${store.plan_type}`}>
                      {store.plan_type}
                    </span>
                  </td>
                  <td>{store.saree_count || 0}</td>
                  <td>{store.device_count || 0}</td>
                  <td>{store.tryon_count || 0}</td>
                  <td>{store.credits_remaining}</td>
                  <td>
                    <span className={`sa-badge ${store.is_active ? 'active' : 'inactive'}`}>
                      {store.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        className="sa-btn outline small" 
                        title="Top Up Credits"
                        onClick={() => setTopUpModal({ open: true, storeId: store.id, storeName: store.store_name, amount: 100 })}
                      >
                        <FiDollarSign />
                      </button>
                      <Link to={`/superadmin/stores/edit/${store.id}`} className="sa-btn outline small" title="Edit">
                        <FiEdit2 />
                      </Link>
                      {store.is_active ? (
                        <button
                          className="sa-btn danger small"
                          title="Deactivate"
                          onClick={() => handleDeactivate(store.id, store.store_name, store.is_active)}
                        >
                          <FiXCircle />
                        </button>
                      ) : (
                        <button
                          className="sa-btn primary small"
                          title="Reactivate"
                          onClick={() => handleDeactivate(store.id, store.store_name, store.is_active)}
                        >
                          <FiCheckCircle />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {topUpModal.open && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1f2937', padding: '24px', borderRadius: '8px', width: '400px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#fff' }}>Top Up Credits for {topUpModal.storeName}</h3>
            <form onSubmit={handleTopUpSubmit}>
              <div className="sa-form-group">
                <label className="sa-form-label">Amount to Add</label>
                <input
                  type="number"
                  className="sa-form-input"
                  min="1"
                  value={topUpModal.amount}
                  onChange={(e) => setTopUpModal(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
                <button type="button" className="sa-btn outline" onClick={() => setTopUpModal({ open: false, storeId: null, storeName: '', amount: 100 })}>
                  Cancel
                </button>
                <button type="submit" className="sa-btn primary">
                  Add Credits
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default StoresDashboard
