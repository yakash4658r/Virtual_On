import { useRef, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Webcam from 'react-webcam'
import { ArrowLeft, Camera as CameraIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useKioskStore from '../../store/kioskStore'
import { startSession as apiStartSession } from '../../api/kioskAPI'
import toast from 'react-hot-toast'

export default function KioskCameraScreen() {
  const navigate = useNavigate()
  const webcamRef = useRef(null)
  const [isFlashing, setIsFlashing] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const startSession = useKioskStore(state => state.startSession)

  const capture = useCallback(async () => {
    if (isCapturing) return
    const imageSrc = webcamRef.current?.getScreenshot()
    if (!imageSrc) return

    setIsFlashing(true)
    setTimeout(() => setIsFlashing(false), 300)
    setIsCapturing(true)

    try {
      const res = await apiStartSession(imageSrc)
      startSession(imageSrc, res.session_id)
      navigate('/admin/tryon')
    } catch (error) {
      console.error("Failed to start session:", error)
      toast.error("Failed to start session. Using local mode.")
      // Fallback for dev
      startSession(imageSrc, "fallback-" + Date.now())
      navigate('/admin/tryon')
    }
  }, [webcamRef, navigate, startSession, isCapturing])

  return (
    <div className="w-full h-full flex flex-col bg-black relative overflow-hidden">
      {/* Flash effect */}
      <AnimatePresence>
        {isFlashing && (
          <motion.div
            className="absolute inset-0 bg-white z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-6">
        <button 
          onClick={() => navigate('/admin')}
          className="w-14 h-14 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white backdrop-blur-sm"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-serif text-[#d4af37] tracking-widest uppercase">Position Yourself</h1>
          <p className="text-gray-400 text-sm tracking-widest">Stand facing the camera</p>
        </div>
        <div className="w-14" />
      </div>

      {/* Camera Feed */}
      <div className="flex-1 relative">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          screenshotQuality={0.92}
          videoConstraints={{ 
            facingMode: "user",
            width: { ideal: 1080 },
            height: { ideal: 1920 }
          }}
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}  // Mirror effect
        />

        {/* Body silhouette guide overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg 
            viewBox="0 0 200 400" 
            className="h-4/5 opacity-20"
            fill="none"
            stroke="#d4af37"
            strokeWidth="1.5"
          >
            {/* Head */}
            <ellipse cx="100" cy="50" rx="30" ry="38" />
            {/* Neck */}
            <rect x="88" y="85" width="24" height="20" rx="5" />
            {/* Shoulders */}
            <path d="M 50 110 Q 30 115 25 140 L 45 145 Q 50 120 88 115 L 112 115 Q 150 120 155 145 L 175 140 Q 170 115 150 110 Z" />
            {/* Body */}
            <path d="M 45 145 L 40 280 L 75 285 L 80 200 L 90 200 L 95 285 L 105 285 L 110 200 L 120 200 L 125 285 L 160 280 L 155 145 Z" />
            {/* Left arm */}
            <path d="M 45 145 Q 20 170 18 220 L 35 225 Q 40 185 50 160" />
            {/* Right arm */}
            <path d="M 155 145 Q 180 170 182 220 L 165 225 Q 160 185 150 160" />
            {/* Left leg */}
            <path d="M 75 285 L 68 380 L 88 380 L 90 310 L 95 310 L 100 380" />
            {/* Right leg */}
            <path d="M 125 285 L 132 380 L 112 380 L 110 310 L 105 310 L 100 380" />
          </svg>
        </div>

        {/* Corner guides */}
        {['top-6 left-6', 'top-6 right-6', 'bottom-6 left-6', 'bottom-6 right-6'].map((pos, i) => (
          <div key={i} className={`absolute ${pos} w-10 h-10 border-[#d4af37] opacity-60`} style={{
            borderTopWidth: pos.includes('top') ? '3px' : '0',
            borderBottomWidth: pos.includes('bottom') ? '3px' : '0',
            borderLeftWidth: pos.includes('left') ? '3px' : '0',
            borderRightWidth: pos.includes('right') ? '3px' : '0',
          }} />
        ))}

        {/* Gradient bottom vignette */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black to-transparent pointer-events-none" />
      </div>

      {/* Capture button */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col items-center pb-12 pt-6">
        <p className="text-gray-400 text-sm tracking-widest uppercase mb-8">
          Make sure your full body is visible
        </p>
        
        <motion.button
          onClick={capture}
          disabled={isCapturing}
          className="relative"
          whileTap={{ scale: 0.95 }}
        >
          {/* Outer ring */}
          <motion.div
            className="w-24 h-24 rounded-full border-4 border-[#d4af37] flex items-center justify-center"
            animate={isCapturing ? {} : { boxShadow: ['0 0 0 0 rgba(212,175,55,0.4)', '0 0 0 20px rgba(212,175,55,0)', '0 0 0 0 rgba(212,175,55,0)'] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {isCapturing ? (
              <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-white" />
            )}
          </motion.div>
        </motion.button>
        
        {isCapturing && (
          <motion.p 
            className="mt-4 text-[#d4af37] tracking-widest text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Starting your session...
          </motion.p>
        )}
      </div>
    </div>
  )
}
