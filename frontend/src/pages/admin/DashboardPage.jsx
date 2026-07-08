import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiBox, FiCheckCircle, FiAlertTriangle, FiUsers,
  FiCamera, FiCalendar, FiTrendingUp, FiDollarSign,
  FiPlusCircle, FiShoppingBag, FiBarChart2, FiDownload,
  FiActivity, FiDatabase, FiServer, FiHardDrive,
  FiClock, FiArrowRight
} from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import tryonAPI from '../../api/tryonAPI'
import StatsCard from '../../components/admin/StatsCard'
import DataTable from '../../components/admin/DataTable'
import { PageLoader } from '../../components/common/Loader'
import { timeAgo, getStatusLabel } from '../../utils/helpers'
import './AdminPages.css'

function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const res = await tryonAPI.getDashboard()
      setDashboard(res.data.data)
    } catch (error) {
      console.error('Dashboard error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const getFormattedDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) return <PageLoader text="Loading dashboard..." />

  const hasDashboard = !!dashboard
  const sarees = dashboard?.sarees || { total: 0, active: 0, out_of_stock: 0 }
  const tryons = dashboard?.tryons || { today: 0, this_week: 0, this_month: 0 }
  const users = dashboard?.users || { total: 0 }
  const popular_sarees = dashboard?.popular_sarees || []
  const recent_sessions = dashboard?.recent_sessions || []
  const ai_stats = dashboard?.ai_stats || { total_cost_usd: 0, avg_processing_time: 0 }

  const quickActions = [
    { label: 'Add Product', icon: <FiPlusCircle />, path: '/admin/products/add', desc: 'Add a new saree' },
    { label: 'View Catalog', icon: <FiShoppingBag />, path: '/admin/products', desc: 'Manage products' },
    { label: 'Barcodes', icon: <FiBarChart2 />, path: '/admin/barcodes', desc: 'Scan & manage' },
    { label: 'Export Data', icon: <FiDownload />, path: '#', desc: 'Download reports' },
  ]

  const recentColumns = [
    { key: 'user_name', label: 'Customer' },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <span className={`status-badge ${val}`}>{getStatusLabel(val)}</span>,
    },
    { key: 'saree_count', label: 'Sarees' },
    {
      key: 'created_at',
      label: 'Time',
      render: (val) => timeAgo(val),
    },
  ]

  return (
    <div className="admin-page">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <h1 className="welcome-greeting">{getGreeting()}, {user?.name || 'Admin'}</h1>
          <p className="welcome-date">{getFormattedDate()}</p>
        </div>
        <div className="welcome-actions">
          <Link to="/admin/products/add" className="welcome-btn">
            <FiPlusCircle /> Add Product
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatsCard
          title="Total Sarees"
          value={sarees.total}
          icon={<FiBox />}
          color="primary"
          trend="up"
          trendValue="+12%"
        />
        <StatsCard
          title="In Stock"
          value={sarees.active}
          icon={<FiCheckCircle />}
          color="success"
          trend="up"
          trendValue="+5%"
        />
        <StatsCard
          title="Out of Stock"
          value={sarees.out_of_stock}
          icon={<FiAlertTriangle />}
          color="warning"
          trend="down"
          trendValue="-2"
        />
        <StatsCard
          title="Total Customers"
          value={users.total}
          icon={<FiUsers />}
          color="info"
          trend="up"
          trendValue="+8%"
        />
      </div>

      <div className="stats-grid stats-grid-secondary">
        <StatsCard
          title="Today's Try-Ons"
          value={tryons.today}
          icon={<FiCamera />}
          color="primary"
        />
        <StatsCard
          title="This Week"
          value={tryons.this_week}
          icon={<FiCalendar />}
          color="success"
        />
        <StatsCard
          title="This Month"
          value={tryons.this_month}
          icon={<FiTrendingUp />}
          color="info"
        />
        <StatsCard
          title="AI Cost (30d)"
          value={`$${ai_stats.total_cost_usd.toFixed(2)}`}
          icon={<FiDollarSign />}
          color="warning"
          subtitle={`Avg: ${ai_stats.avg_processing_time}s per image`}
        />
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2 className="section-heading">Quick Actions</h2>
        <div className="quick-actions-grid">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.path}
              className="quick-action-card"
            >
              <div className="quick-action-icon">{action.icon}</div>
              <div className="quick-action-info">
                <p className="quick-action-label">{action.label}</p>
                <p className="quick-action-desc">{action.desc}</p>
              </div>
              <FiArrowRight className="quick-action-arrow" />
            </Link>
          ))}
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Recent Sessions */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-heading">
              <FiClock className="section-heading-icon" />
              Recent Try-On Sessions
            </h2>
            <Link to="/admin/tryon-history" className="view-all-link">
              View All <FiArrowRight />
            </Link>
          </div>
          <DataTable
            columns={recentColumns}
            data={recent_sessions}
            emptyMessage="No sessions yet"
          />
        </div>

        {/* Right Column */}
        <div className="dashboard-right-col">
          {/* Popular Sarees */}
          <div className="dashboard-section">
            <h2 className="section-heading">
              <FiTrendingUp className="section-heading-icon" />
              Most Popular Sarees
            </h2>
            <div className="popular-list">
              {popular_sarees && popular_sarees.length > 0 ? (
                popular_sarees.map((item, index) => (
                  <div key={index} className="popular-item">
                    <span className="popular-rank">#{index + 1}</span>
                    <div className="popular-info">
                      <p className="popular-name">{item.saree__name}</p>
                      <p className="popular-code">{item.saree__barcode_id}</p>
                    </div>
                    <span className="popular-count">{item.try_count} tries</span>
                  </div>
                ))
              ) : (
                <p className="no-data">No data yet</p>
              )}
            </div>
          </div>

          {/* System Health */}
          <div className="dashboard-section">
            <h2 className="section-heading">
              <FiActivity className="section-heading-icon" />
              System Health
            </h2>
            <div className="health-list">
              <div className="health-item">
                <div className="health-dot health-dot-green"></div>
                <FiServer className="health-icon" />
                <span className="health-label">API Server</span>
                <span className="health-status health-ok">Operational</span>
              </div>
              <div className="health-item">
                <div className="health-dot health-dot-green"></div>
                <FiDatabase className="health-icon" />
                <span className="health-label">Database</span>
                <span className="health-status health-ok">Connected</span>
              </div>
              <div className="health-item">
                <div className="health-dot health-dot-green"></div>
                <FiHardDrive className="health-icon" />
                <span className="health-label">Storage</span>
                <span className="health-status health-ok">Available</span>
              </div>
              <div className="health-item">
                <div className="health-dot health-dot-yellow"></div>
                <FiCamera className="health-icon" />
                <span className="health-label">AI Engine</span>
                <span className="health-status health-mock">Mock Mode</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage