import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useKioskStore from '../../store/kioskStore'
import { QRCodeSVG } from 'qrcode.react'
import { completeSession } from '../../api/kioskAPI'
import { Heart, ShoppingBag, RefreshCw } from 'lucide-react'

export default function KioskSummaryScreen() {
  const navigate = useNavigate()
  const { favorites, sessionId, products, resetKiosk } = useKioskStore()

  useEffect(() => {
    if (favorites.length === 0) {
      navigate('/admin')
      return
    }
    if (sessionId) {
      completeSession(sessionId).catch(console.error)
    }
  }, [favorites, navigate, sessionId])

  const handleFinish = () => {
    resetKiosk()
    navigate('/admin')
  }

  const getFavoriteProduct = (sareeId) => {
    return products.find(p => p.id === sareeId)
  }

  return (
    <div className="w-full h-full flex flex-col bg-black overflow-hidden relative">
      {/* Ambient top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #d4af37 0%, transparent 70%)' }} />

      {/* Header */}
      <div className="relative z-10 text-center pt-16 pb-8 px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Animated checkmark */}
          <motion.div
            className="w-24 h-24 rounded-full border-2 border-[#d4af37] flex items-center justify-center mx-auto mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.15), transparent)' }}
          >
            <motion.span
              className="text-5xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              ✓
            </motion.span>
          </motion.div>
          
          <h1 className="text-6xl font-serif tracking-[0.2em] text-[#d4af37] uppercase mb-3">
            Thank You
          </h1>
          <p className="text-gray-400 text-lg tracking-widest uppercase">
            Your selections • {favorites.length} Saree{favorites.length !== 1 ? 's' : ''} Curated
          </p>
        </motion.div>
      </div>

      {/* Selected sarees grid */}
      <div className="flex-1 overflow-y-auto px-8 pb-4">
        <div className="grid grid-cols-2 gap-4 max-w-3xl mx-auto">
          {favorites.map((fav, i) => {
            const product = getFavoriteProduct(fav.sareeId)
            return (
              <motion.div
                key={fav.sareeId}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="rounded-2xl overflow-hidden border border-gray-800 bg-[#111] relative"
              >
                {/* Tryon result or product image */}
                <div className="aspect-square relative">
                  <img 
                    src={fav.tryonResultUrl || product?.image_url} 
                    alt={product?.name || 'Selection'}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white font-serif text-lg leading-tight">{product?.name || 'Saree'}</p>
                    {product?.price && (
                      <p className="text-[#d4af37] text-sm mt-1">₹{product.price.toLocaleString()}</p>
                    )}
                  </div>
                </div>
                {/* Favorited badge */}
                <div className="absolute top-3 right-3 bg-white/10 backdrop-blur-md rounded-full p-2">
                  <Heart size={16} className="text-red-400 fill-current" />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Action bar */}
      <div className="px-8 pb-12 pt-6 flex flex-col items-center gap-5 border-t border-gray-900">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-xl py-5 rounded-full text-xl font-semibold tracking-widest uppercase flex items-center justify-center gap-3"
          style={{
            background: 'linear-gradient(135deg, #d4af37 0%, #f5d97a 50%, #d4af37 100%)',
            color: '#000',
            boxShadow: '0 0 30px rgba(212,175,55,0.3)',
          }}
          onClick={() => {
            const toast = document.createElement('div')
            toast.textContent = '✓ Staff has been notified!'
            toast.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:#1a1a1a;color:#d4af37;padding:16px 32px;border-radius:999px;font-size:18px;border:1px solid rgba(212,175,55,0.3);z-index:9999;animation:fadeIn 0.3s ease'
            document.body.appendChild(toast)
            setTimeout(() => toast.remove(), 3000)
          }}
        >
          <ShoppingBag size={24} />
          Proceed to Purchase
        </motion.button>

        {/* QR Code section */}
        {sessionId && !sessionId.startsWith('fallback') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col items-center gap-3"
          >
            <p className="text-gray-600 text-xs tracking-widest uppercase">Scan to save results on your phone</p>
            <div className="bg-white p-3 rounded-xl">
              <QRCodeSVG value={`https://yakash.tech/qr/${sessionId}`} size={100} />
            </div>
          </motion.div>
        )}

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          onClick={handleFinish}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-lg tracking-widest uppercase mt-2"
        >
          <RefreshCw size={20} />
          Start New Session
        </motion.button>
      </div>
    </div>
  )
}
