import { useState, useRef, useCallback } from 'react'
import tryonAPI from '../api/tryonAPI'
import toast from 'react-hot-toast'

export function useTryon() {

  const [sessionId, setSessionId] = useState(null)
  const [sessionData, setSessionData] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isAllDone, setIsAllDone] = useState(false)
  const pollingRef = useRef(null)

  // Start try-on
  const startTryOn = async (photoFile) => {
    try {
      setIsProcessing(true)
      setIsAllDone(false)

      toast.loading('Starting virtual try-on...', { id: 'tryon' })

      const response = await tryonAPI.startTryOn(photoFile)
      const { session_id } = response.data.data

      setSessionId(session_id)

      toast.dismiss('tryon')
      toast.success('Processing started!')

      // Start polling
      startPolling(session_id)

      return { success: true, sessionId: session_id }

    } catch (error) {
      toast.dismiss('tryon')
      const message = error.response?.data?.message || 'Failed to start'
      toast.error(message)
      setIsProcessing(false)
      return { success: false, message }
    }
  }

  // Poll for results
  const startPolling = useCallback((sid) => {
    // Clear any existing polling
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
    }

    pollingRef.current = setInterval(async () => {
      try {
        const response = await tryonAPI.getStatus(sid)
        const data = response.data.data

        setSessionData(data)

        if (response.data.is_all_done) {
          // Stop polling
          clearInterval(pollingRef.current)
          pollingRef.current = null

          setIsProcessing(false)
          setIsAllDone(true)

          toast.success('All try-on results ready!')
        }

      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 3000) // Poll every 3 seconds
  }, [])

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
    setIsProcessing(false)
  }, [])

  // Retry failed result
  const retryResult = async (resultId) => {
    try {
      toast.loading('Retrying...', { id: 'retry' })

      await tryonAPI.retryResult(resultId)

      toast.dismiss('retry')
      toast.success('Retry started')

      // Restart polling
      if (sessionId) {
        setIsProcessing(true)
        setIsAllDone(false)
        startPolling(sessionId)
      }

      return { success: true }

    } catch (error) {
      toast.dismiss('retry')
      toast.error('Retry failed')
      return { success: false }
    }
  }

  // Reset everything
  const resetTryon = useCallback(() => {
    stopPolling()
    setSessionId(null)
    setSessionData(null)
    setIsProcessing(false)
    setIsAllDone(false)
  }, [stopPolling])

  return {
    sessionId,
    sessionData,
    isProcessing,
    isAllDone,
    startTryOn,
    stopPolling,
    retryResult,
    resetTryon,
  }
}