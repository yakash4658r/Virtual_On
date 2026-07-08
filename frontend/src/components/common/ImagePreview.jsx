import { useState } from 'react'
import { PLACEHOLDER_IMAGE } from '../../utils/constants'
import { getImageUrl } from '../../utils/helpers'

function ImagePreview({ src, alt, className = '', onClick = null }) {
  const [error, setError] = useState(false)

  const imageUrl = error ? PLACEHOLDER_IMAGE : getImageUrl(src) || PLACEHOLDER_IMAGE

  return (
    <img
      src={imageUrl}
      alt={alt || 'Image'}
      className={className}
      onClick={onClick}
      onError={() => setError(true)}
      loading="lazy"
      style={onClick ? { cursor: 'pointer' } : {}}
    />
  )
}

export default ImagePreview