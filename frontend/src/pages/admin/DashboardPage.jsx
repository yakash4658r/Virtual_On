import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import storeAPI from '../../api/storeAPI'
import './DashboardPage.css'

function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await storeAPI.getDashboardStats()
      setStats(res.data.data)
    } catch (err) {
      console.error("Failed to load dashboard stats", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="dashboard-loading">Loading dashboard...</div>

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="dashboard-container"
    >
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Store Overview</h1>
          <p className="dashboard-subtitle">Welcome back. Here's what's happening today.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stat-cards-grid">
        <StatCard 
          title="Try-Ons Today" 
          value={stats?.tryons?.today || 0}
          subtitle={`${stats?.tryons?.this_week || 0} this week`}
          icon="👗"
          color="purple"
        />
        <StatCard 
          title="Active Devices" 
          value={stats?.devices?.online || 0}
          subtitle={`Out of ${stats?.devices?.total || 0} registered`}
          icon="🖥️"
          color="emerald"
        />
        <StatCard 
          title="Total Sarees" 
          value={stats?.sarees?.total || 0}
          subtitle={`${stats?.sarees?.active || 0} active in catalog`}
          icon="🛍️"
          color="blue"
        />
        <StatCard 
          title="Total Customers" 
          value={stats?.users?.total || 0}
          subtitle="Saved profiles"
          icon="👥"
          color="amber"
        />
      </div>

      <div className="dashboard-main-grid">
        {/* Recent Sessions */}
        <div className="dashboard-card recent-sessions-card">
          <div className="dashboard-card-header">
            <h2 className="dashboard-card-title">Recent Try-On Sessions</h2>
            <button 
              onClick={() => navigate('/admin/sessions')}
              className="view-all-btn"
            >
              View All
            </button>
          </div>
          
          {stats?.recent_sessions?.length > 0 ? (
            <div className="session-list">
              {stats.recent_sessions.map((session, i) => (
                <div key={session.id} className="session-item">
                  <div className="session-info-left">
                    <div className="session-icon">
                      📸
                    </div>
                    <div>
                      <p className="session-name">Session {session.id.slice(0,8)}</p>
                      <p className="session-device">Device: {session.device_id}</p>
                    </div>
                  </div>
                  <div className="session-info-right">
                    <span className={`session-status status-${session.status}`}>
                      {session.status.toUpperCase()}
                    </span>
                    <p className="session-time">
                      {new Date(session.created_at + 'Z').toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              No sessions recorded yet today.
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card quick-actions-card">
          <h2 className="dashboard-card-title">Quick Actions</h2>
          <div className="quick-actions-list">
            <button 
              onClick={() => navigate('/admin/products/add')}
              className="quick-action-btn action-primary"
            >
              <span className="action-icon">➕</span>
              <div className="action-text">
                <p className="action-title">Add New Saree</p>
                <p className="action-desc">Upload images & generate barcode</p>
              </div>
            </button>
            <button 
              onClick={() => navigate('/admin/devices')}
              className="quick-action-btn action-secondary"
            >
              <span className="action-icon">🖥️</span>
              <div className="action-text">
                <p className="action-title">Manage Devices</p>
                <p className="action-desc">Check mirror status</p>
              </div>
            </button>
            <button 
              onClick={() => navigate('/admin/barcodes')}
              className="quick-action-btn action-tertiary"
            >
              <span className="action-icon">🖨️</span>
              <div className="action-text">
                <p className="action-title">Print Barcodes</p>
                <p className="action-desc">Download barcode PDFs for tags</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function StatCard({ title, value, subtitle, icon, color }) {
  return (
    <div className={`stat-card card-${color}`}>
      <div className="stat-card-content">
        <p className="stat-card-title">{title}</p>
        <h3 className="stat-card-value">{value}</h3>
        {subtitle && <p className="stat-card-subtitle">{subtitle}</p>}
      </div>
      <div className="stat-card-icon-wrapper">
        {icon}
      </div>
    </div>
  )
}

export default DashboardPage