import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import storeAPI from '../../api/storeAPI'

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
      console.error("Failed to load sessions", err)
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
      className="p-6 max-w-7xl mx-auto space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Session Gallery</h1>
          <p className="text-gray-500 mt-1">Review customer try-on sessions</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${filter === 'completed' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            Completed
          </button>
          <button 
            onClick={() => setFilter('failed')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${filter === 'failed' ? 'bg-red-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            Failed
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading gallery...</div>
      ) : filteredSessions.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <span className="text-4xl mb-4 block">📸</span>
          <h3 className="text-lg font-medium text-gray-900">No sessions found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredSessions.map(session => (
            <motion.div 
              key={session.id}
              whileHover={{ y: -5, scale: 1.02 }}
              onClick={() => setSelectedSession(session)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer group"
            >
              <div className="aspect-[3/4] relative bg-gray-100">
                {session.result_image ? (
                  <img src={session.result_image} alt="Result" className="w-full h-full object-cover" />
                ) : session.customer_image ? (
                  <img src={session.customer_image} alt="Original" className="w-full h-full object-cover opacity-50 grayscale" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                )}
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-white/90 text-gray-900 font-medium px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm text-sm">
                    View Details
                  </span>
                </div>

                <div className="absolute top-2 right-2">
                  <span className={`w-3 h-3 block rounded-full shadow-sm border-2 border-white ${
                    session.status === 'completed' ? 'bg-green-500' : 
                    session.status === 'failed' ? 'bg-red-500' : 'bg-amber-500'
                  }`} />
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs text-gray-500 truncate mb-1">ID: {session.id}</p>
                <p className="text-xs font-medium text-gray-700">{new Date(session.created_at + 'Z').toLocaleString()}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal for detailed view */}
      <AnimatePresence>
        {selectedSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSession(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl relative z-10 w-full max-w-4xl overflow-hidden flex flex-col md:flex-row"
            >
              <div className="md:w-1/2 bg-gray-50 p-6 flex flex-col items-center justify-center border-r border-gray-100">
                <div className="w-full max-w-sm aspect-[3/4] rounded-2xl overflow-hidden shadow-sm relative">
                  {selectedSession.result_image ? (
                    <img src={selectedSession.result_image} alt="Result" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                      Processing / Failed
                    </div>
                  )}
                  {selectedSession.customer_image && (
                    <div className="absolute bottom-4 right-4 w-20 h-28 rounded-lg overflow-hidden border-2 border-white shadow-lg">
                      <img src={selectedSession.customer_image} alt="Original" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="md:w-1/2 p-8 relative">
                <button 
                  onClick={() => setSelectedSession(null)}
                  className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  ✕
                </button>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Session Details</h3>
                
                <div className="space-y-4">
                  <DetailRow label="Session ID" value={<span className="font-mono text-sm">{selectedSession.id}</span>} />
                  <DetailRow label="Status" value={
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      selectedSession.status === 'completed' ? 'bg-green-100 text-green-700' : 
                      selectedSession.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {selectedSession.status.toUpperCase()}
                    </span>
                  } />
                  <DetailRow label="Device" value={selectedSession.device_id} />
                  <DetailRow label="Saree ID" value={selectedSession.saree_id} />
                  <DetailRow label="Date" value={new Date(selectedSession.created_at + 'Z').toLocaleString()} />
                  <DetailRow label="Processing Time" value={`${selectedSession.processing_time_ms} ms`} />
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <a 
                    href={selectedSession.result_image} 
                    download
                    target="_blank"
                    rel="noreferrer"
                    className={`block w-full text-center py-3 rounded-xl font-medium transition-colors ${
                      selectedSession.result_image 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
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
    <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="text-gray-900 font-medium text-right">{value}</span>
    </div>
  )
}

export default SessionGalleryPage
