import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider'
import { X } from 'lucide-react'

export default function CompareModal({ isOpen, onClose, referenceImage, tryonResultImage }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-8">
      <button 
        onClick={onClose}
        className="absolute top-8 right-8 text-white bg-transparent outline-none border-none p-4"
      >
        <X size={48} />
      </button>
      
      <div className="w-full max-w-4xl aspect-[3/4] md:aspect-square bg-[var(--bg-secondary)] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.15)] relative">
        <ReactCompareSlider
          className="w-full h-full"
          itemOne={<ReactCompareSliderImage src={referenceImage} alt="Reference" />}
          itemTwo={<ReactCompareSliderImage src={tryonResultImage} alt="Result" />}
        />
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/70 px-6 py-2 rounded-full text-[var(--accent-gold)] tracking-widest text-sm uppercase pointer-events-none">
          Drag to Compare
        </div>
      </div>
    </div>
  )
}
