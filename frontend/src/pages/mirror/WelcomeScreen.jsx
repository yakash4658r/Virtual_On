import { useOutletContext, useNavigate } from 'react-router-dom'

function WelcomeScreen() {
  const { deviceId, storeInfo } = useOutletContext()
  const navigate = useNavigate()

  return (
    <div className="mirror-welcome">
      {storeInfo?.store_logo && (
        <img src={storeInfo.store_logo} alt="Store Logo" style={{ width: '120px', borderRadius: '20px' }} />
      )}
      <h1 className="store-name">
        {storeInfo?.store_name || 'Smart Mirror'}
      </h1>
      <p className="store-subtitle">AI Virtual Saree Try-On Experience</p>
      
      <button 
        className="mirror-btn-start"
        onClick={() => navigate(`/mirror/${deviceId}/search`)}
      >
        TAP TO START
      </button>
      
      <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.3)', marginTop: '20px' }}>
        Device: {deviceId}
      </p>
    </div>
  )
}

export default WelcomeScreen
