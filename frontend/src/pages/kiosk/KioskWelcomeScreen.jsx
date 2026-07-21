import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import useKioskStore from '../../store/kioskStore'
import { useEffect, useState } from 'react'

// Animated floating orb
function FloatingOrb({ x, y, size, delay, color }) {
  return (
    <motion.div
      className="absolute rounded-full blur-3xl opacity-20 pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, background: color }}
      animate={{ y: [0, -30, 0], x: [0, 15, 0], scale: [1, 1.1, 1] }}
      transition={{ duration: 6 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    />
  )
}

export default function KioskWelcomeScreen() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const resetKiosk = useKioskStore(state => state.resetKiosk)
  const [showPulse, setShowPulse] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShowPulse(true), 1200)
    return () => clearTimeout(t)
  }, [])

  const handleStart = () => {
    resetKiosk()
    navigate('/admin/camera')
  }

  return (
    <div 
      className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden cursor-pointer"
      style={{ background: 'radial-gradient(ellipse at center, #0d0d0d 0%, #000000 100%)' }}
      onClick={handleStart}
    >
      {/* Ambient background orbs */}
      <FloatingOrb x={10} y={20} size="400px" delay={0} color="#d4af37" />
      <FloatingOrb x={70} y={60} size="300px" delay={2} color="#8b5e3c" />
      <FloatingOrb x={40} y={80} size="250px" delay={4} color="#d4af37" />
      <FloatingOrb x={80} y={10} size="200px" delay={1} color="#c084fc" />

      {/* Gold particle lines */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 80px, rgba(212,175,55,0.03) 80px, rgba(212,175,55,0.03) 81px)',
      }} />

      <div className="z-10 text-center flex flex-col items-center px-8">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-10"
        >
          <div 
            className="w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-8 border border-[rgba(212,175,55,0.4)]"
            style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)' }}
          >
            <span className="text-5xl">✨</span>
          </div>
        </motion.div>

        {/* Store name */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h1 
            className="font-serif tracking-[0.3em] uppercase mb-3"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', color: '#d4af37' }}
          >
            {user?.store_name || 'VIRTUAL DRAPE'}
          </h1>
          <div className="flex items-center gap-4 justify-center mb-2">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-[#d4af37]" />
            <p className="text-lg tracking-[0.5em] text-gray-400 uppercase">Virtual Try-On</p>
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-[#d4af37]" />
          </div>
          <p className="text-gray-600 tracking-widest text-sm uppercase mt-1">Experience the future of fashion</p>
        </motion.div>

        {/* Touch to begin CTA */}
        {showPulse && (
          <motion.div
            className="mt-24 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Pulse rings */}
            <motion.div
              className="absolute inset-0 rounded-full border border-[rgba(212,175,55,0.3)]"
              animate={{ scale: [1, 1.6, 1.6], opacity: [0.7, 0, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border border-[rgba(212,175,55,0.2)]"
              animate={{ scale: [1, 2, 2], opacity: [0.5, 0, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
            />
            
            <motion.button
              className="relative px-16 py-6 rounded-full text-2xl font-semibold tracking-[0.2em] uppercase"
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #f5d97a 50%, #d4af37 100%)',
                color: '#000',
                boxShadow: '0 0 40px rgba(212,175,55,0.4), 0 0 80px rgba(212,175,55,0.15)',
              }}
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              Touch to Begin
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <motion.p
        className="absolute bottom-8 text-gray-700 text-sm tracking-widest uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        Powered by AI • Feel the fabric without touching it
      </motion.p>
    </div>
  )
}
