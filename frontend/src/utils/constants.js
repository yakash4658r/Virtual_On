export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Saree Virtual Try-On'

export const FABRIC_OPTIONS = [
  { value: 'silk', label: 'Silk' },
  { value: 'cotton', label: 'Cotton' },
  { value: 'chiffon', label: 'Chiffon' },
  { value: 'georgette', label: 'Georgette' },
  { value: 'organza', label: 'Organza' },
  { value: 'linen', label: 'Linen' },
  { value: 'banarasi', label: 'Banarasi' },
  { value: 'crepe', label: 'Crepe' },
  { value: 'net', label: 'Net' },
  { value: 'satin', label: 'Satin' },
  { value: 'other', label: 'Other' },
]

export const OCCASION_OPTIONS = [
  { value: 'wedding', label: 'Wedding' },
  { value: 'festival', label: 'Festival' },
  { value: 'party', label: 'Party' },
  { value: 'casual', label: 'Casual' },
  { value: 'office', label: 'Office' },
  { value: 'bridal', label: 'Bridal' },
]

export const MAX_CART_ITEMS = 5

export const TRYON_POLL_INTERVAL = 3000

export const STATUS_COLORS = {
  pending: '#FF9800',
  processing: '#2196F3',
  completed: '#4CAF50',
  failed: '#F44336',
}

export const PLACEHOLDER_IMAGE = 'https://placehold.co/400x500/8B1A4A/ffffff?text=No+Image'