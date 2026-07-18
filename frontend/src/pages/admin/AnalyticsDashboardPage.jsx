import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import storeAPI from '../../api/storeAPI'

function AnalyticsDashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    storeAPI.getDashboardStats().then(res => {
      setStats(res.data.data)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="p-8 text-center text-gray-500">Loading analytics...</div>

  // Mock data for charts
  const peakHours = [
    { hour: '10 AM', count: 12 },
    { hour: '12 PM', count: 35 },
    { hour: '2 PM', count: 28 },
    { hour: '4 PM', count: 45 },
    { hour: '6 PM', count: 60 },
    { hour: '8 PM', count: 20 },
  ]

  const maxCount = Math.max(...peakHours.map(p => p.count))

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 max-w-7xl mx-auto space-y-6"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Analytics & Usage</h1>
        <p className="text-gray-500 mt-1">Deep dive into your store's smart mirror performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl mb-4">
            🤖
          </div>
          <h3 className="text-gray-500 font-medium">AI Credits Used</h3>
          <p className="text-4xl font-bold text-gray-900 mt-2">{stats?.tryons?.this_month || 0}</p>
          <p className="text-sm text-gray-400 mt-1">This Month</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mb-4">
            📈
          </div>
          <h3 className="text-gray-500 font-medium">Conversion Rate (Est.)</h3>
          <p className="text-4xl font-bold text-gray-900 mt-2">12.4%</p>
          <p className="text-sm text-green-500 mt-1">↑ 2.1% from last week</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-3xl mb-4">
            ⏱️
          </div>
          <h3 className="text-gray-500 font-medium">Avg Processing Time</h3>
          <p className="text-4xl font-bold text-gray-900 mt-2">6.2s</p>
          <p className="text-sm text-gray-400 mt-1">Per try-on request</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Peak Hours Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Peak Usage Hours</h2>
          <div className="flex items-end justify-between h-48 gap-2">
            {peakHours.map((data, i) => (
              <div key={i} className="flex flex-col items-center flex-1 gap-2 group">
                <div className="relative flex justify-center w-full h-full">
                  <div 
                    className="absolute bottom-0 w-full bg-indigo-200 rounded-t-md group-hover:bg-indigo-400 transition-colors"
                    style={{ height: `${(data.count / maxCount) * 100}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded transition-opacity">
                      {data.count}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-medium text-gray-500">{data.hour}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Sarees */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Top 5 Most Tried Sarees</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-500">
                    #{i}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Kanjivaram Silk - Demo {i}</p>
                    <p className="text-xs text-gray-500">Barcode: SAREE-DEMO-00{i}</p>
                  </div>
                </div>
                <div className="font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                  {80 - i*12} tries
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default AnalyticsDashboardPage
