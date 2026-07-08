export function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

export function validatePassword(password) {
  if (password.length < 8) {
    return 'Password must be at least 8 characters'
  }
  return null
}

export function validatePhone(phone) {
  if (!phone) return null
  const regex = /^[0-9]{10}$/
  if (!regex.test(phone)) {
    return 'Phone number must be 10 digits'
  }
  return null
}

export function validateImage(file) {
  const maxSize = 10 * 1024 * 1024
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

  if (!file) return 'Image is required'
  if (file.size > maxSize) return 'Image must be less than 10MB'
  if (!allowedTypes.includes(file.type)) return 'Only JPEG, PNG, WebP allowed'

  return null
}

export function validatePrice(price) {
  if (!price || price <= 0) return 'Price must be greater than 0'
  return null
}