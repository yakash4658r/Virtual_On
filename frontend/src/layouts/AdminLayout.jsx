import { useState } from 'react'
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  FiGrid, FiShoppingBag, FiBarChart2,
  FiTag, FiClock, FiSettings, FiChevronLeft,
  FiChevronRight, FiLogOut, FiUser, FiLayers,
  FiPlusCircle, FiMonitor, FiImage, FiActivity
} from 'react-icons/fi'
import Navbar from './Navbar'
import './AdminLayout.css'

function AdminLayout() {
  const { user, isAdmin, loading, logout } = useAuth()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  if (loading) return null

  if (!isAdmin) {
    return <Navigate to="/login" replace />
  }

  const menuSections = [
    {
      title: 'Main',
      items: [
        { path: '/admin', icon: <FiGrid />, label: 'Dashboard', exact: true },
        { path: '/admin/sessions', icon: <FiClock />, label: 'Try-On History' },
      ],
    },
    {
      title: 'Catalog Management',
      items: [
        { path: '/admin/products', icon: <FiShoppingBag />, label: 'Products' },
        { path: '/admin/products/add', icon: <FiPlusCircle />, label: 'Add Product' },
        { path: '/admin/categories', icon: <FiLayers />, label: 'Categories' },
        { path: '/admin/barcodes', icon: <FiBarChart2 />, label: 'Barcodes' },
      ],
    },
    {
      title: 'System',
      items: [
        { path: '/admin/settings', icon: <FiSettings />, label: 'Store Settings' },
      ],
    },
  ]

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="admin-layout">
      <Navbar />
      <div className="admin-container">
        <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-header">
            {!collapsed && <h3 className="sidebar-title">Admin Panel</h3>}
            <button
              className="sidebar-toggle"
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? 'Expand' : 'Collapse'}
            >
              {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
            </button>
          </div>

          <nav className="sidebar-nav">
            {menuSections.map((section) => (
              <div key={section.title} className="sidebar-section">
                {!collapsed && (
                  <p className="sidebar-section-title">{section.title}</p>
                )}
                {section.items.map((item) => {
                  const isActive = item.exact
                    ? location.pathname === item.path
                    : location.pathname.startsWith(item.path) && !item.exact

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`sidebar-link ${isActive ? 'active' : ''}`}
                      title={collapsed ? item.label : ''}
                    >
                      <span className="sidebar-link-icon">{item.icon}</span>
                      {!collapsed && <span className="sidebar-link-text">{item.label}</span>}
                    </Link>
                  )
                })}
              </div>
            ))}
          </nav>

          <div className="sidebar-footer">
            {!collapsed ? (
              <div className="sidebar-user">
                <div className="sidebar-avatar">
                  <FiUser />
                </div>
                <div className="sidebar-user-info">
                  <p className="sidebar-user-name">{user?.name || 'Admin'}</p>
                  <p className="sidebar-user-role">{user?.role || 'Super Admin'}</p>
                </div>
              </div>
            ) : (
              <div className="sidebar-avatar sidebar-avatar-collapsed">
                <FiUser />
              </div>
            )}
            <button
              className="sidebar-logout"
              onClick={handleLogout}
              title="Logout"
            >
              <FiLogOut />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </aside>

        <main className={`admin-main ${collapsed ? 'expanded' : ''}`}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout