import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import storeAPI from '../../api/storeAPI'
import './SessionGalleryPage.css'

function SessionGalleryPage() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, completed, failed
  const [selectedSession, setSelectedSession] = useState(null)

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const res = await storeAPI.getSessions()
      setSessions(res.data.data)
    } catch (err) {
      toast.error('Failed to load try-on sessions')
    } finally {
      setLoading(false)
    }
  }

  const filteredSessions = sessions.filter(s => {
    if (filter === 'all') return true
    return s.status === filter
  })

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="session-gallery-container"
    >
      <div className="session-gallery-header">
        <div>
          <h1 className="session-gallery-title">Session Gallery</h1>
          <p className="session-gallery-subtitle">Review customer try-on sessions</p>
        </div>
        <div className="session-filter-group">
          <button 
            onClick={() => setFilter('all')}
            className={`session-filter-btn ${filter === 'all' ? 'active-all' : ''}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('completed')}
            className={`session-filter-btn ${filter === 'completed' ? 'active-completed' : ''}`}
          >
            Completed
          </button>
          <button 
            onClick={() => setFilter('failed')}
            className={`session-filter-btn ${filter === 'failed' ? 'active-failed' : ''}`}
          >
            Failed
          </button>
        </div>
      </div>

      {loading ? (
        <div className="session-loading">Loading gallery...</div>
      ) : filteredSessions.length === 0 ? (
        <div className="session-empty-state">
          <span className="session-empty-icon">📸</span>
          <h3 className="session-empty-title">No sessions found</h3>
          <p className="session-empty-subtitle">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="session-grid">
          {filteredSessions.map(session => (
            <motion.div 
              key={session.id}
              whileHover={{ y: -5, scale: 1.02 }}
              onClick={() => setSelectedSession(session)}
              className="session-card"
            >
              <div className="session-image-wrapper">
                {session.result_image ? (
                  <img src={session.result_image} alt="Result" className="session-image" />
                ) : session.customer_image ? (
                  <img src={session.customer_image} alt="Original" className="session-image pending" />
                ) : (
                  <div className="session-no-image">No Image</div>
                )}
                
                <div className="session-overlay">
                  <span className="session-view-btn">
                    View Details
                  </span>
                </div>

                <div className="session-status-dot-wrapper">
                  <span className={`session-status-dot ${
                    session.status === 'completed' ? 'dot-completed' : 
                    session.status === 'failed' ? 'dot-failed' : 'dot-pending'
                  }`} />
                </div>
              </div>
              <div className="session-card-info">
                <p className="session-card-id">ID: {session.id}</p>
                <p className="session-card-time">{new Date(session.created_at + 'Z').toLocaleString()}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal for detailed view */}
      <AnimatePresence>
        {selectedSession && (
          <div className="lightbox-overlay-wrapper">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSession(null)}
              className="lightbox-backdrop"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="lightbox-content-wrapper"
            >
              <div className="lightbox-left-panel">
                <div className="lightbox-image-container">
                  {selectedSession.result_image ? (
                    <img src={selectedSession.result_image} alt="Result" className="lightbox-main-img" />
                  ) : (
                    <div className="lightbox-placeholder">
                      Processing / Failed
                    </div>
                  )}
                  {selectedSession.customer_image && (
                    <div className="lightbox-thumbnail">
                      <img src={selectedSession.customer_image} alt="Original" className="lightbox-thumb-img" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="lightbox-right-panel">
                <button 
                  onClick={() => setSelectedSession(null)}
                  className="lightbox-close-btn"
                >
                  ✕
                </button>
                
                <h3 className="lightbox-title">Session Details</h3>
                
                <div className="lightbox-details-list">
                  <DetailRow label="Session ID" value={<span className="mono text-sm">{selectedSession.id}</span>} />
                  <DetailRow label="Status" value={
                    <span className={`lightbox-status-badge ${
                      selectedSession.status === 'completed' ? 'badge-completed' : 
                      selectedSession.status === 'failed' ? 'badge-failed' : 'badge-pending'
                    }`}>
                      {selectedSession.status.toUpperCase()}
                    </span>
                  } />
                  <DetailRow label="Device" value={selectedSession.device_id} />
                  <DetailRow label="Saree ID" value={selectedSession.saree_id} />
                  <DetailRow label="Date" value={new Date(selectedSession.created_at + 'Z').toLocaleString()} />
                  <DetailRow label="Processing Time" value={`${selectedSession.processing_time_ms} ms`} />
                </div>
                
                <div className="lightbox-footer">
                  <a 
                    href={selectedSession.result_image} 
                    download
                    target="_blank"
                    rel="noreferrer"
                    className={`lightbox-download-btn ${
                      selectedSession.result_image 
                        ? 'btn-active' 
                        : 'btn-disabled'
                    }`}
                    onClick={e => !selectedSession.result_image && e.preventDefault()}
                  >
                    Download Result Image
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value}</span>
    </div>
  )
}

export default SessionGalleryPage
