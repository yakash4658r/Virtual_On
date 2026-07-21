import { Outlet, useNavigate } from 'react-router-dom'
import { useKioskMode } from '../../hooks/useKioskMode'
import { useIdleTimer } from '../../hooks/useIdleTimer'
import useKioskStore from '../../store/kioskStore'
import { Settings } from 'lucide-react'
import '../../styles/kiosk.css'

export default function KioskLayout() {
  useKioskMode() // Applies fullscreen, disables right-click etc.
  
  const navigate = useNavigate()
  const resetKiosk = useKioskStore((state) => state.resetKiosk)

  const { isIdleWarning, timeLeft } = useIdleTimer(120000, () => {
    // On complete timeout (120s + 15s)
    resetKiosk()
    navigate('/admin')
  })

  const handleManageClick = () => {
    // Only allow navigating to backend if they tap the gear icon
    // A real implementation might ask for a PIN here
    if (window.confirm("Switch to Store Owner Backend?")) {
      navigate('/admin/manage')
    }
  }

  return (
    <div className="kiosk-mode relative w-full h-full">
      {/* Hidden button to escape kiosk mode to backend management */}
      <button 
        onClick={handleManageClick}
        className="absolute top-4 right-4 z-50 p-4 text-white/30 hover:text-white transition-colors bg-transparent shadow-none min-h-0 min-w-0 border-none outline-none"
        aria-label="Manage Store"
      >
        <Settings size={32} />
      </button>

      {/* Main Kiosk Views */}
      <Outlet />

      {/* Idle Warning Overlay */}
      {isIdleWarning && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="text-center">
            <h2 className="text-5xl text-white font-serif mb-6">Are you still there?</h2>
            <p className="text-2xl text-gray-400 mb-8">
              Session ending in <span className="text-[var(--accent-yellow)] font-bold">{timeLeft}</span> seconds
            </p>
            <button className="kiosk-btn-primary" onClick={() => {}}>
              YES, KEEP BROWSING
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
