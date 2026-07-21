import { useState, useEffect, useRef } from 'react'

export function useIdleTimer(timeoutMs = 120000, onTimeout) {
  const [isIdleWarning, setIsIdleWarning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(15) // 15 seconds warning
  const idleTimer = useRef(null)
  const countdownTimer = useRef(null)

  const resetTimer = () => {
    setIsIdleWarning(false)
    setTimeLeft(15)
    
    if (idleTimer.current) clearTimeout(idleTimer.current)
    if (countdownTimer.current) clearInterval(countdownTimer.current)

    idleTimer.current = setTimeout(() => {
      setIsIdleWarning(true)
      
      countdownTimer.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimer.current)
            if (onTimeout) onTimeout()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }, timeoutMs)
  }

  useEffect(() => {
    resetTimer()

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'touchmove']
    
    // Only reset if we are NOT in the warning phase, OR if we are, reset everything
    const handleInteraction = () => resetTimer()

    events.forEach(e => document.addEventListener(e, handleInteraction))

    return () => {
      events.forEach(e => document.removeEventListener(e, handleInteraction))
      if (idleTimer.current) clearTimeout(idleTimer.current)
      if (countdownTimer.current) clearInterval(countdownTimer.current)
    }
  }, [timeoutMs, onTimeout])

  return { isIdleWarning, timeLeft, resetTimer }
}
