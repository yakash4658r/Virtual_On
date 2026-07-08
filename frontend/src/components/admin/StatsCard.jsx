import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi'
import './StatsCard.css'

function StatsCard({ title, value, icon, color = 'primary', subtitle = '', trend = null, trendValue = '' }) {
  const getTrendIcon = () => {
    if (trend === 'up') return <FiTrendingUp />
    if (trend === 'down') return <FiTrendingDown />
    return <FiMinus />
  }

  return (
    <div className={`stats-card stats-${color}`}>
      <div className="stats-card-header">
        <div className="stats-icon-wrapper">
          <span className="stats-icon">{icon}</span>
        </div>
        {trend && (
          <div className={`stats-trend stats-trend-${trend}`}>
            {getTrendIcon()}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div className="stats-info">
        <p className="stats-value">{value}</p>
        <p className="stats-title">{title}</p>
        {subtitle && <p className="stats-subtitle">{subtitle}</p>}
      </div>
    </div>
  )
}

export default StatsCard