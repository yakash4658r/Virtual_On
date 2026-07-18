import { useState } from 'react'
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  FiGrid, FiShoppingBag, FiMonitor,
  FiBarChart2, FiChevronLeft, FiChevronRight,
  FiLogOut, FiUser, FiPlusCircle
} from 'react-icons/fi'
import Navbar from './Navbar'
import './SuperAdminLayout.css'

function SuperAdminLayout() {
  const { user, loading, logout } = useAuth()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  if (loading) return null

  // Only super_admin can access
  if (!user || user.role !== 'super_admin') {
    return <Navigate to="/login" replace />
  }

  const menuSections = [
    {
      title: 'Overview',
      items: [
        { path: '/superadmin', icon: <FiGrid />, label: 'Dashboard', exact: true },
        { path: '/superadmin/analytics', icon: <FiBarChart2 />, label: 'Global Analytics' },
      ],
    },
    {
      title: 'Management',
      items: [
        { path: '/superadmin/stores', icon: <FiShoppingBag />, label: 'Stores' },
        { path: '/superadmin/stores/new', icon: <FiPlusCircle />, label: 'Add Store' },
        { path: '/superadmin/devices', icon: <FiMonitor />, label: 'Devices' },
      ],
    },
  ]

  return (
    <div className="superadmin-layout">
      <Navbar />
      <div className="superadmin-container">
        <aside className={`sa-sidebar ${collapsed ? 'collapsed' : ''}`}>
          <div className="sa-sidebar-header">
            {!collapsed && <h3 className="sa-sidebar-title">Super Admin</h3>}
            <button
              className="sa-sidebar-toggle"
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? 'Expand' : 'Collapse'}
            >
              {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
            </button>
          </div>

          <nav className="sa-sidebar-nav">
            {menuSections.map((section) => (
              <div key={section.title} className="sa-nav-section">
                {!collapsed && (
                  <p className="sa-nav-section-title">{section.title}</p>
                )}
                {section.items.map((item) => {
                  const isActive = item.exact
                    ? location.pathname === item.path
                    : location.pathname.startsWith(item.path)

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`sa-nav-link ${isActive ? 'active' : ''}`}
                      title={collapsed ? item.label : ''}
                    >
                      <span className="sa-nav-link-icon">{item.icon}</span>
                      {!collapsed && <span className="sa-nav-link-text">{item.label}</span>}
                    </Link>
                  )
                })}
              </div>
            ))}
          </nav>

          <div className="sa-sidebar-footer">
            {!collapsed ? (
              <div className="sa-user-badge">
                <div className="sa-user-avatar">
                  <FiUser />
                </div>
                <div className="sa-user-info">
                  <p className="sa-user-name">{user?.name || 'Super Admin'}</p>
                  <p className="sa-user-role">Platform Owner</p>
                </div>
              </div>
            ) : (
              <div className="sa-user-avatar" style={{ margin: '0 auto' }}>
                <FiUser />
              </div>
            )}
            <button className="sa-logout-btn" onClick={logout} title="Logout">
              <FiLogOut />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </aside>

        <main className={`sa-main ${collapsed ? 'expanded' : ''}`}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default SuperAdminLayout
