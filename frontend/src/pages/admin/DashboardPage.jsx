import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import storeAPI from '../../api/storeAPI'

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

  if (loading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 max-w-7xl mx-auto space-y-6"
    >
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Store Overview</h1>
          <p className="text-gray-500 mt-1">Welcome back. Here's what's happening today.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Try-Ons Today" 
          value={stats?.tryons?.today || 0}
          subtitle={`${stats?.tryons?.this_week || 0} this week`}
          icon="👗"
          color="bg-purple-100 text-purple-600"
        />
        <StatCard 
          title="Active Devices" 
          value={stats?.devices?.online || 0}
          subtitle={`Out of ${stats?.devices?.total || 0} registered`}
          icon="🖥️"
          color="bg-emerald-100 text-emerald-600"
        />
        <StatCard 
          title="Total Sarees" 
          value={stats?.sarees?.total || 0}
          subtitle={`${stats?.sarees?.active || 0} active in catalog`}
          icon="🛍️"
          color="bg-blue-100 text-blue-600"
        />
        <StatCard 
          title="Total Customers" 
          value={stats?.users?.total || 0}
          subtitle="Saved profiles"
          icon="👥"
          color="bg-amber-100 text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Recent Sessions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Recent Try-On Sessions</h2>
            <button 
              onClick={() => navigate('/admin/sessions')}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              View All
            </button>
          </div>
          
          {stats?.recent_sessions?.length > 0 ? (
            <div className="space-y-4">
              {stats.recent_sessions.map((session, i) => (
                <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                      📸
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Session {session.id.slice(0,8)}</p>
                      <p className="text-xs text-gray-500">Device: {session.device_id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      session.status === 'completed' ? 'bg-green-100 text-green-700' :
                      session.status === 'processing' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {session.status.toUpperCase()}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(session.created_at + 'Z').toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No sessions recorded yet today.
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/admin/sarees/new')}
              className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-left"
            >
              <span className="text-2xl">➕</span>
              <div>
                <p className="font-semibold text-gray-800">Add New Saree</p>
                <p className="text-xs text-gray-500">Upload images & generate barcode</p>
              </div>
            </button>
            <button 
              onClick={() => navigate('/admin/devices')}
              className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-colors text-left"
            >
              <span className="text-2xl">🖥️</span>
              <div>
                <p className="font-semibold text-gray-800">Manage Devices</p>
                <p className="text-xs text-gray-500">Check mirror status</p>
              </div>
            </button>
            <button 
              onClick={() => navigate('/admin/barcodes')}
              className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-amber-500 hover:bg-amber-50 transition-colors text-left"
            >
              <span className="text-2xl">🖨️</span>
              <div>
                <p className="font-semibold text-gray-800">Print Barcodes</p>
                <p className="text-xs text-gray-500">Download barcode PDFs for tags</p>
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
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-2">{subtitle}</p>}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
    </div>
  )
}

export default DashboardPage