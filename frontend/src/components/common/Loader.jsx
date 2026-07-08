import './Loader.css'

function Loader({ size = 'medium', text = '' }) {
  return (
    <div className={`loader-container loader-${size}`}>
      <div className="spinner"></div>
      {text && <p className="loader-text">{text}</p>}
    </div>
  )
}

export function PageLoader({ text = 'Loading...' }) {
  return (
    <div className="page-loader">
      <div className="spinner large"></div>
      <p className="loader-text">{text}</p>
    </div>
  )
}

export function InlineLoader() {
  return <div className="spinner small inline"></div>
}

export default Loader