import ImagePreview from '../common/ImagePreview'
import './TryOnSlot.css'

function TryOnSlot({ item, index }) {
  if (!item) return null

  const { saree } = item

  return (
    <div className="tryon-slot">
      <span className="slot-num">{index + 1}</span>
      <ImagePreview
        src={saree?.image_front}
        alt={saree?.name}
        className="slot-image"
      />
      <p className="slot-name">{saree?.name}</p>
    </div>
  )
}

export default TryOnSlot