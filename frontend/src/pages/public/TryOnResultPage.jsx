import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  FiArrowLeft, FiRefreshCw, FiShare2,
  FiPlusCircle, FiDownload
} from 'react-icons/fi'
import { useTryon } from '../../hooks/useTryon'
import TryOnResult from '../../components/tryon/TryOnResult'
import TryOnLoading from '../../components/tryon/TryOnLoading'
import TryOnComparison from '../../components/tryon/TryOnComparison'
import Button from '../../components/common/Button'
import { PageLoader } from '../../components/common/Loader'
import { getImageUrl } from '../../utils/helpers'
import toast from 'react-hot-toast'
import './TryOnResultPage.css'

function TryOnResultPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const {
    sessionData,
    isProcessing,
    isAllDone,
    retryResult,
    resetTryon,
    stopPolling,
  } = useTryon()

  const [comparisonResult, setComparisonResult] = useState(null)
  const [initialLoading, setInitialLoading] = useState(true)

  // Start polling on mount
  useEffect(() => {
    if (sessionId) {
      // useTryon hook internally handles polling
      // We need to start it manually here
      const { startPolling } = require('../../hooks/useTryon')
    }

    return () => {
      stopPolling()
    }
  }, [sessionId])

  // Manual polling since we land directly on this page
  useEffect(() => {
    let interval = null

    const pollStatus = async () => {
      try {
        const tryonAPI = (await import('../../api/tryonAPI')).default
        const response = await tryonAPI.getStatus(sessionId)
        const data = response.data.data

        // Update session data through a workaround
        // Since useTryon doesn't expose setSessionData
        setLocalSessionData(data)
        setLocalIsAllDone(response.data.is_all_done)

        if (response.data.is_all_done) {
          clearInterval(interval)
          toast.success('All try-on results are ready!')
        }
      } catch (error) {
        console.error('Poll error:', error)
      } finally {
        setInitialLoading(false)
      }
    }

    pollStatus()
    interval = setInterval(pollStatus, 3000)

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [sessionId])

  const [localSessionData, setLocalSessionData] = useState(null)
  const [localIsAllDone, setLocalIsAllDone] = useState(false)

  const activeSessionData = localSessionData || sessionData

  const handleRetry = async (resultId) => {
    try {
      const tryonAPI = (await import('../../api/tryonAPI')).default
      await tryonAPI.retryResult(resultId)
      toast.success('Retry started')
    } catch (error) {
      toast.error('Retry failed')
    }
  }

  const handleShare = () => {
    const shareUrl = window.location.href
    navigator.clipboard.writeText(shareUrl)
    toast.success('Link copied! Share via WhatsApp')
  }

  const handleNewSession = () => {
    resetTryon()
    navigate('/catalog')
  }

  if (initialLoading) {
    return <PageLoader text="Loading results..." />
  }

  if (!activeSessionData) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon"></div>
        <p className="empty-state-text">Session not found</p>
        <Link to="/catalog">
          <Button variant="primary" style={{ marginTop: '20px' }}>
            Browse Sarees
          </Button>
        </Link>
      </div>
    )
  }

  const { results, customer_photo, progress, status } = activeSessionData
  const isStillProcessing = status === 'processing' && !localIsAllDone

  // Find current processing saree
  const currentProcessing = results?.find(
    (r) => r.status === 'processing'
  )

  return (
    <div className="result-page">
      {/* Comparison overlay */}
      {comparisonResult && (
        <TryOnComparison
          result={comparisonResult}
          customerPhoto={customer_photo}
          onClose={() => setComparisonResult(null)}
        />
      )}

      <Link to="/cart" className="back-link">
        <FiArrowLeft /> Back to Cart
      </Link>

      <div className="result-header">
        <div>
          <h1 className="section-title">
            {localIsAllDone ? ' Your Try-On Results' : ' Processing...'}
          </h1>
          <p className="section-subtitle">
            Progress: {progress} •{' '}
            {isStillProcessing ? 'AI is generating your looks...' : 'All done!'}
          </p>
        </div>

        {localIsAllDone && (
          <div className="result-header-actions">
            <Button
              variant="ghost"
              size="small"
              onClick={handleShare}
              icon={<FiShare2 />}
            >
              Share
            </Button>
          </div>
        )}
      </div>

      {/* Still processing — show loading */}
      {isStillProcessing && !results?.some((r) => r.status === 'completed') && (
        <TryOnLoading
          progress={progress}
          currentSaree={currentProcessing?.saree?.name}
        />
      )}

      {/* Results grid */}
      {results && results.length > 0 && (
        <div className="results-container">
          {/* Original photo */}
          {customer_photo && (
            <div className="original-photo-card">
              <img
                src={getImageUrl(customer_photo)}
                alt="Your photo"
                className="original-photo"
                onError={(e) => {
                  e.target.src = 'https://placehold.co/300x400/333/fff?text=Photo'
                }}
              />
              <p className="original-label"> Your Photo</p>
            </div>
          )}

          {/* Try-on results */}
          <div className="results-grid">
            {results.map((result) => (
              <TryOnResult
                key={result.id}
                result={result}
                onRetry={handleRetry}
                onFullscreen={(r) => setComparisonResult(r)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Bottom actions */}
      {localIsAllDone && (
        <div className="result-bottom-actions">
          <Button
            variant="primary"
            size="large"
            onClick={handleNewSession}
            icon={<FiPlusCircle />}
          >
            Try More Sarees
          </Button>

          <Button
            variant="secondary"
            size="medium"
            onClick={handleShare}
            icon={<FiShare2 />}
          >
            Share Results
          </Button>

          <Link to="/catalog">
            <Button variant="ghost" size="medium">
              Browse More Sarees
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}

export default TryOnResultPage