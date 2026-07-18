import { useState, useEffect } from 'react'
import superadminAPI from '../../api/superadminAPI'
import { FiShoppingBag, FiMonitor, FiImage, FiUsers, FiActivity } from 'react-icons/fi'
import '../../layouts/SuperAdminLayout.css'

function GlobalAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      const res = await superadminAPI.getGlobalAnalytics()
      setData(res.data.data)
    } catch {
      console.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="sa-page">
        <div className="sa-empty">
          <p className="sa-empty-text">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="sa-page">
        <div className="sa-empty">
          <div className="sa-empty-icon"><FiActivity /></div>
          <p className="sa-empty-text">Failed to load analytics data</p>
        </div>
      </div>
    )
  }

  const stats = [
    { icon: <FiShoppingBag />, color: 'purple', value: data.stores?.total || 0, label: 'Total Stores', sub: `${data.stores?.active || 0} active` },
    { icon: <FiMonitor />, color: 'emerald', value: data.devices?.total || 0, label: 'Total Devices', sub: `${data.devices?.online || 0} online` },
    { icon: <FiImage />, color: 'amber', value: data.tryons?.total || 0, label: 'Total Try-Ons', sub: 'all time' },
    { icon: <FiShoppingBag />, color: 'sky', value: data.sarees?.total || 0, label: 'Total Sarees', sub: 'across all stores' },
    { icon: <FiUsers />, color: 'rose', value: data.users?.total || 0, label: 'Total Users', sub: 'registered accounts' },
  ]

  return (
    <div className="sa-page">
      <div className="sa-page-header">
        <h1 className="sa-page-title">Global Analytics</h1>
        <p className="sa-page-subtitle">Platform-wide statistics and performance overview</p>
      </div>

      <div className="sa-stats-grid">
        {stats.map((stat, i) => (
          <div className="sa-stat-card" key={i}>
            <div className={`sa-stat-icon ${stat.color}`}>{stat.icon}</div>
            <div>
              <div className="sa-stat-value">{stat.value}</div>
              <div className="sa-stat-label">{stat.label}</div>
              <div style={{ fontSize: '11px', color: '#4b5563', marginTop: '2px' }}>{stat.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Platform Health */}
      <div className="sa-table-wrap" style={{ padding: '24px' }}>
        <h3 className="sa-table-title" style={{ marginBottom: '20px' }}>Platform Health</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div style={{ padding: '16px', background: 'rgba(16,185,129,0.06)', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.15)' }}>
            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Active Store Rate</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#34d399' }}>
              {data.stores?.total ? Math.round((data.stores.active / data.stores.total) * 100) : 0}%
            </div>
          </div>
          <div style={{ padding: '16px', background: 'rgba(14,165,233,0.06)', borderRadius: '10px', border: '1px solid rgba(14,165,233,0.15)' }}>
            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Device Online Rate</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#38bdf8' }}>
              {data.devices?.total ? Math.round((data.devices.online / data.devices.total) * 100) : 0}%
            </div>
          </div>
          <div style={{ padding: '16px', background: 'rgba(124,58,237,0.06)', borderRadius: '10px', border: '1px solid rgba(124,58,237,0.15)' }}>
            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Avg Sarees/Store</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#a78bfa' }}>
              {data.stores?.total ? Math.round(data.sarees.total / data.stores.total) : 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GlobalAnalytics
