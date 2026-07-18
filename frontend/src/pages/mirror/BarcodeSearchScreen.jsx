import { useState } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import mirrorAPI from '../../api/mirrorAPI'

function BarcodeSearchScreen() {
  const { deviceId } = useOutletContext()
  const navigate = useNavigate()
  const [barcode, setBarcode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [recentSearches] = useState(['SAREE-DEMO-001', 'SAREE-DEMO-002'])

  const handleSearch = async () => {
    if (!barcode.trim()) return
    setLoading(true)
    setError('')
    
    try {
      const res = await mirrorAPI.searchBarcode(barcode.trim())
      if (res.data.success) {
        navigate(`/mirror/${deviceId}/saree`, { state: { saree: res.data.data } })
      }
    } catch (err) {
      setError('Saree not found. Please check the barcode and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="mirror-search">
      <button className="mirror-btn-back" onClick={() => navigate(`/mirror/${deviceId}`)}>
        ← Back
      </button>
      
      <h2>🔍 Enter Saree Barcode</h2>
      <p style={{ fontSize: '22px', color: 'rgba(255,255,255,0.5)' }}>
        Find the barcode tag on the saree and type it below
      </p>
      
      <div className="mirror-search-input-wrap">
        <input
          className="mirror-search-input"
          type="text"
          placeholder="e.g. SAREE-DEMO-001"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value.toUpperCase())}
          onKeyPress={handleKeyPress}
          autoFocus
        />
        <button 
          className="mirror-btn mirror-btn-primary"
          onClick={handleSearch}
          disabled={loading}
          style={{ minWidth: '160px' }}
        >
          {loading ? '...' : '🔍 Search'}
        </button>
      </div>
      
      {error && (
        <p style={{ color: '#e74c3c', fontSize: '22px' }}>❌ {error}</p>
      )}
      
      <div style={{ marginTop: '30px' }}>
        <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.4)', marginBottom: '16px' }}>
          Recent Searches:
        </p>
        <div className="mirror-recent">
          {recentSearches.map(code => (
            <button 
              key={code}
              className="mirror-recent-chip"
              onClick={() => { setBarcode(code); }}
            >
              {code}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BarcodeSearchScreen
