import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useKioskStore from '../../store/kioskStore'
import toast from 'react-hot-toast'
import CompareModal from './CompareModal'
import { getKioskProducts, runTryOn as apiRunTryOn, toggleFavorite as apiToggleFavorite } from '../../api/kioskAPI'

const PROCESSING_STEPS = [
  'Analyzing your silhouette...',
  'Draping the fabric...',
  'Adjusting the pleats...',
  'Finalizing the look...',
]

export default function KioskTryOnScreen() {
  const navigate = useNavigate()
  const [isCompareOpen, setIsCompareOpen] = useState(false)
  const [processingStep, setProcessingStep] = useState(0)
  
  // Zustand Store
  const { 
    sessionId,
    customerPhoto, 
    products, 
    currentSareeId, 
    currentSareeIndex,
    currentTryOnResult,
    isProcessing,
    favorites,
    setProducts,
    selectSaree,
    setProcessing,
    setTryOnResult,
    setProcessingError,
    addToFavorites,
    removeFromFavorites
  } = useKioskStore()

  // For testing, if no photo go back
  useEffect(() => {
    if (!customerPhoto) navigate('/admin')
  }, [customerPhoto, navigate])

  // Fetch products on mount
  useEffect(() => {
    if (products.length === 0) {
      getKioskProducts().then(sarees => {
        setProducts(sarees)
        // Auto-select first saree
        if (sarees.length > 0 && !currentSareeId) {
          handleSelectSaree(sarees[0].id)
        }
      }).catch(err => console.error("Failed to fetch products:", err))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle Saree Selection & trigger AI
  const handleSelectSaree = useCallback(async (sareeId) => {
    if (sareeId === currentSareeId) return;
    selectSaree(sareeId)
    
    // Reuse cached result
    const existingFav = favorites.find(f => f.sareeId === sareeId)
    if (existingFav && existingFav.tryonResultUrl) {
      setTryOnResult(existingFav.tryonResultUrl)
      return
    }

    setProcessing(true)
    setProcessingStep(0)
    // Cycle through steps
    const stepInterval = setInterval(() => {
      setProcessingStep(s => (s + 1) % PROCESSING_STEPS.length)
    }, 2500)
    
    try {
      const res = await apiRunTryOn(sessionId, sareeId)
      clearInterval(stepInterval)
      setTryOnResult(res.tryon_result_url)
    } catch (err) {
      clearInterval(stepInterval)
      console.error(err)
      setProcessingError("Failed to process try-on")
      toast.error(err.response?.data?.detail || "Failed to process Try-on.")
    }
  }, [currentSareeId, selectSaree, favorites, sessionId, setProcessing, setTryOnResult, setProcessingError])

  const currentSaree = products[currentSareeIndex]
  const isFavorited = favorites.some(f => f.sareeId === currentSareeId)

  const handleFavoriteToggle = async () => {
    if (!currentSareeId) return
    
    // Optimistic UI update
    if (isFavorited) {
      removeFromFavorites(currentSareeId)
    } else {
      addToFavorites(currentSareeId, currentTryOnResult)
      toast.success('Added to your selections', {
        icon: '❤️',
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      })
    }

    try {
      await apiToggleFavorite(sessionId, currentSareeId)
    } catch (err) {
      console.error("Failed to sync favorite:", err)
    }
  }

  const handleContinue = () => {
    if (favorites.length === 0) {
      toast.error('Please favorite at least one saree to continue.')
      return
    }
    navigate('/admin/summary')
  }

  return (
    <div className="w-full h-full flex flex-col bg-[var(--bg-primary)]">
      {/* 1. Header (60px) */}
      <div className="h-[80px] px-8 flex justify-between items-center bg-black">
        <button 
          onClick={() => navigate('/admin/camera')}
          className="flex items-center gap-2 text-white bg-transparent shadow-none"
        >
          <ArrowLeft size={32} />
        </button>
        <h1 className="text-3xl font-serif text-[var(--accent-gold)] tracking-widest uppercase">
          Virtual Try-On
        </h1>
        <div className="relative">
          <Heart size={32} className="text-white" />
          <div className="absolute -top-2 -right-2 bg-[var(--heart-red)] text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center">
            {favorites.length}
          </div>
        </div>
      </div>

      {/* 2. Main Display Area (Split 50/50) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Reference Saree */}
        <div className="w-1/2 h-full p-4 border-r border-gray-800">
          <div className="w-full h-full bg-[var(--bg-secondary)] rounded-2xl overflow-hidden relative">
            {currentSaree ? (
              <img src={currentSaree.image_url} alt="Saree Reference" className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                Select a saree below
              </div>
            )}
            <div className="absolute top-4 left-4 bg-black/70 px-4 py-2 rounded-full text-white text-sm tracking-widest uppercase">
              Reference
            </div>
          </div>
        </div>

        {/* Right: AI Try-On Result */}
        <div className="w-1/2 h-full p-4">
          <div className="w-full h-full bg-[var(--bg-secondary)] rounded-2xl overflow-hidden relative flex flex-col items-center justify-center">
            {isProcessing ? (
              <div className="text-center px-8">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-gray-800" />
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#d4af37] animate-spin" />
                  <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-[#d4af3760] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                </div>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={processingStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-[#d4af37] tracking-widest text-lg"
                  >
                    {PROCESSING_STEPS[processingStep]}
                  </motion.p>
                </AnimatePresence>
              </div>
            ) : currentTryOnResult ? (
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentTryOnResult}
                  src={currentTryOnResult}
                  alt="Result"
                  className="w-full h-full object-contain"
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                />
              </AnimatePresence>
            ) : customerPhoto ? (
              <img src={customerPhoto} alt="Customer" className="w-full h-full object-contain opacity-50" />
            ) : null}
            <div className="absolute top-4 left-4 bg-[var(--accent-gold)] text-black px-4 py-2 rounded-full font-bold text-sm tracking-widest uppercase">
              Result
            </div>
            
            {/* Compare Button */}
            {currentTryOnResult && (
              <button 
                className="absolute bottom-4 right-4 bg-white text-black px-6 py-3 rounded-full font-bold shadow-lg"
                onClick={() => setIsCompareOpen(true)}
              >
                Compare
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Product Info & Action Bar */}
      <div className="h-[120px] bg-black border-t border-gray-800 px-8 flex justify-between items-center">
        <div>
          {currentSaree ? (
            <>
              <h2 className="text-3xl font-serif text-white mb-2">{currentSaree.name}</h2>
              <p className="text-xl text-[var(--accent-gold)] tracking-wide">
                ID: {currentSaree.barcode || 'N/A'} • ₹{currentSaree.price || 'Ask Staff'}
              </p>
            </>
          ) : (
            <h2 className="text-3xl font-serif text-gray-600">Select a saree</h2>
          )}
        </div>
        
        <div className="flex gap-6 items-center">
          <button 
            onClick={handleFavoriteToggle}
            className={`w-[80px] h-[80px] rounded-full flex items-center justify-center border-2 transition-all ${
              isFavorited ? 'bg-white border-white' : 'bg-transparent border-gray-600'
            }`}
          >
            <Heart 
              size={40} 
              className={isFavorited ? "kiosk-heart-active fill-current" : "text-white"} 
            />
          </button>
          
          <button 
            onClick={handleContinue}
            className="kiosk-btn-primary min-w-[300px] h-[80px]"
          >
            CONTINUE WITH {favorites.length} ITEM{favorites.length !== 1 && 'S'}
          </button>
        </div>
      </div>

      {/* 4. Product Catalog Bar (Horizontal Scroll) */}
      <div className="h-[250px] bg-[var(--bg-secondary)] border-t border-gray-800 flex flex-col px-8 py-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl tracking-widest text-white uppercase">Browse Collection</h3>
          <div className="flex items-center gap-2 text-gray-400">
            <span>Filter</span>
            <ChevronDown size={20} />
          </div>
        </div>
        
        <div className="flex-1 flex gap-6 overflow-x-auto kiosk-hide-scrollbar pb-4 items-center">
          {products.map((saree) => (
            <div 
              key={saree.id}
              onClick={() => handleSelectSaree(saree.id)}
              className={`flex-shrink-0 w-[140px] h-[140px] rounded-2xl overflow-hidden relative border-4 transition-all cursor-pointer ${
                currentSareeId === saree.id 
                  ? 'border-[var(--accent-gold)] shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-105' 
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={saree.image_url} alt={saree.name} className="w-full h-full object-cover" />
              {/* If favorited, show heart on thumbnail */}
              {favorites.some(f => f.sareeId === saree.id) && (
                <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md">
                  <Heart size={16} className="text-[var(--heart-red)] fill-current" />
                </div>
              )}
            </div>
          ))}
          {products.length === 0 && (
            <div className="text-gray-500 italic">No sarees loaded.</div>
          )}
        </div>
      </div>

      <CompareModal 
        isOpen={isCompareOpen} 
        onClose={() => setIsCompareOpen(false)} 
        referenceImage={customerPhoto} 
        tryonResultImage={currentTryOnResult} 
      />
    </div>
  )
}
