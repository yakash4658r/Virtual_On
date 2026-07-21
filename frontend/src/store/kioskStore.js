import { create } from 'zustand'

const useKioskStore = create((set) => ({
  // Session State
  sessionId: null,
  customerPhoto: null,
  sessionStartTime: null,
  
  // Product State
  products: [],
  currentSareeId: null,
  currentSareeIndex: 0,
  
  // Try-on State
  currentTryOnResult: null,
  isProcessing: false,
  processingError: null,
  
  // Selections / Favorites State
  favorites: [], // array of { sareeId, tryonResultUrl }

  // Actions
  startSession: (photo, sessionId) => set({
    sessionId,
    customerPhoto: photo,
    sessionStartTime: Date.now(),
    favorites: [],
    currentTryOnResult: null
  }),

  setProducts: (productsList) => set({ products: productsList }),
  
  selectSaree: (sareeId) => set((state) => {
    const index = state.products.findIndex(p => p.id === sareeId);
    return {
      currentSareeId: sareeId,
      currentSareeIndex: index !== -1 ? index : 0,
      currentTryOnResult: null,
      processingError: null
    };
  }),

  setProcessing: (isProcessing) => set({ isProcessing }),
  setTryOnResult: (resultUrl) => set({ currentTryOnResult: resultUrl, isProcessing: false, processingError: null }),
  setProcessingError: (error) => set({ processingError: error, isProcessing: false }),
  
  addToFavorites: (sareeId, tryonResultUrl) => set((state) => {
    if (state.favorites.some(f => f.sareeId === sareeId)) return state;
    return { favorites: [...state.favorites, { sareeId, tryonResultUrl }] };
  }),

  removeFromFavorites: (sareeId) => set((state) => ({
    favorites: state.favorites.filter(f => f.sareeId !== sareeId)
  })),

  endSession: () => set({
    sessionId: null,
    customerPhoto: null,
    sessionStartTime: null,
    currentSareeId: null,
    currentTryOnResult: null,
    favorites: [],
    isProcessing: false
  }),

  resetKiosk: () => set({
    sessionId: null,
    customerPhoto: null,
    sessionStartTime: null,
    currentSareeId: null,
    currentTryOnResult: null,
    favorites: [],
    isProcessing: false
  })
}))

export default useKioskStore
