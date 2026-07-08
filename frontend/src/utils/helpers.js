export function formatPrice(price) {
  if (!price) return '₹0'
  return `₹${Number(price).toLocaleString('en-IN')}`
}

export function truncateText(text, maxLength = 50) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function getImageUrl(imagePath) {
  if (!imagePath) return null
  if (imagePath.startsWith('http')) return imagePath
  return `${import.meta.env.VITE_API_URL?.replace('/api', '')}${imagePath}`
}

export function timeAgo(dateString) {
  const now = new Date()
  const date = new Date(dateString)
  const seconds = Math.floor((now - date) / 1000)

  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString('en-IN')
}

export function getStatusColor(status) {
  const colors = {
    pending: '#FF9800',
    processing: '#2196F3',
    completed: '#4CAF50',
    failed: '#F44336',
  }
  return colors[status] || '#999'
}

export function getStatusLabel(status) {
  const labels = {
    pending: ' Pending',
    processing: ' Processing',
    completed: ' Completed',
    failed: ' Failed',
  }
  return labels[status] || status
}

export function downloadImage(url, filename) {
  const link = document.createElement('a')
  link.href = url
  link.download = filename || 'tryon-result.png'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}