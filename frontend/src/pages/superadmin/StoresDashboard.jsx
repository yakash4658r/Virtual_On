import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import superadminAPI from '../../api/superadminAPI'
import { FiShoppingBag, FiEdit2, FiXCircle, FiPlus, FiSearch } from 'react-icons/fi'
import '../../layouts/SuperAdminLayout.css'
import toast from 'react-hot-toast'

function StoresDashboard() {
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

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

  const handleDeactivate = async (storeId, storeName) => {
    if (!window.confirm(`Deactivate "${storeName}"? This will disable the store.`)) return
    try {
      await superadminAPI.deactivateStore(storeId)
      toast.success(`${storeName} deactivated`)
      loadStores()
    } catch (err) {
      toast.error('Failed to deactivate store')
    }
  }

  const filtered = stores.filter(
    (s) =>
      s.store_name.toLowerCase().includes(search.toLowerCase()) ||
      s.store_code.toLowerCase().includes(search.toLowerCase())
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
                      {store.store_code}
                    </code>
                  </td>
                  <td>
                    <span className={`sa-badge ${store.subscription_plan}`}>
                      {store.subscription_plan}
                    </span>
                  </td>
                  <td>{store.saree_count}</td>
                  <td>{store.device_count}</td>
                  <td>{store.tryon_count}</td>
                  <td>{store.ai_credits_remaining}</td>
                  <td>
                    <span className={`sa-badge ${store.is_active ? 'active' : 'inactive'}`}>
                      {store.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="sa-btn outline small" title="Edit">
                        <FiEdit2 />
                      </button>
                      {store.is_active && (
                        <button
                          className="sa-btn danger small"
                          title="Deactivate"
                          onClick={() => handleDeactivate(store.id, store.store_name)}
                        >
                          <FiXCircle />
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
    </div>
  )
}

export default StoresDashboard
