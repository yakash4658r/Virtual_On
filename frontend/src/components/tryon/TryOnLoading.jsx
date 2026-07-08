import './TryOnLoading.css'

function TryOnLoading({ progress, currentSaree }) {
  return (
    <div className="tryon-loading">
      <div className="loading-animation">
        <div className="loading-circle"></div>
        <div className="loading-circle delay-1"></div>
        <div className="loading-circle delay-2"></div>
      </div>

      <h2 className="loading-title"> AI is working its magic...</h2>

      <p className="loading-progress">
        Progress: {progress || '0/0'}
      </p>

      {currentSaree && (
        <p className="loading-current">
          Currently processing: {currentSaree}
        </p>
      )}

      <div className="loading-tips">
        <p> This usually takes 15-30 seconds per saree</p>
        <p> AI is matching the saree drape to your body</p>
        <p> Please don't close this page</p>
      </div>
    </div>
  )
}

export default TryOnLoading