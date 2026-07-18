import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import storeAPI from '../../api/storeAPI'
import './AnalyticsDashboardPage.css'

function AnalyticsDashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    storeAPI.getDashboardStats().then(res => {
      setStats(res.data.data)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="analytics-loading">Loading analytics...</div>

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
      className="analytics-container"
    >
      <div className="analytics-header">
        <h1 className="analytics-title">Analytics & Usage</h1>
        <p className="analytics-subtitle">Deep dive into your store's smart mirror performance.</p>
      </div>

      <div className="analytics-kpi-grid">
        <div className="analytics-card kpi-card">
          <div className="kpi-icon-wrapper icon-blue">
            🤖
          </div>
          <h3 className="kpi-title">AI Credits Used</h3>
          <p className="kpi-value">{stats?.tryons?.this_month || 0}</p>
          <p className="kpi-subtitle">This Month</p>
        </div>

        <div className="analytics-card kpi-card">
          <div className="kpi-icon-wrapper icon-emerald">
            📈
          </div>
          <h3 className="kpi-title">Conversion Rate (Est.)</h3>
          <p className="kpi-value">12.4%</p>
          <p className="kpi-subtitle text-green">↑ 2.1% from last week</p>
        </div>

        <div className="analytics-card kpi-card">
          <div className="kpi-icon-wrapper icon-purple">
            ⏱️
          </div>
          <h3 className="kpi-title">Avg Processing Time</h3>
          <p className="kpi-value">6.2s</p>
          <p className="kpi-subtitle">Per try-on request</p>
        </div>
      </div>

      <div className="analytics-charts-grid">
        {/* Peak Hours Chart */}
        <div className="analytics-card">
          <h2 className="analytics-card-title">Peak Usage Hours</h2>
          <div className="chart-container">
            {peakHours.map((data, i) => (
              <div key={i} className="chart-bar-group">
                <div className="chart-bar-wrapper">
                  <div 
                    className="chart-bar-fill"
                    style={{ height: `${(data.count / maxCount) * 100}%` }}
                  >
                    <div className="chart-tooltip">
                      {data.count}
                    </div>
                  </div>
                </div>
                <span className="chart-label">{data.hour}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Sarees */}
        <div className="analytics-card">
          <h2 className="analytics-card-title">Top 5 Most Tried Sarees</h2>
          <div className="top-sarees-list">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="top-saree-item">
                <div className="top-saree-info">
                  <div className="top-saree-rank">
                    #{i}
                  </div>
                  <div>
                    <p className="top-saree-name">Kanjivaram Silk - Demo {i}</p>
                    <p className="top-saree-barcode">Barcode: SAREE-DEMO-00{i}</p>
                  </div>
                </div>
                <div className="top-saree-count">
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
