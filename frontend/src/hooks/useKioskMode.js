import { useEffect } from 'react'

export function useKioskMode() {
  useEffect(() => {
    // Attempt to enter fullscreen
    const requestFullScreen = () => {
      const docEl = document.documentElement
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(() => {})
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen().catch(() => {})
      }
    }

    // Try to trigger on first interaction
    const handleFirstInteraction = () => {
      requestFullScreen()
      window.removeEventListener('click', handleFirstInteraction)
      window.removeEventListener('touchstart', handleFirstInteraction)
    }

    window.addEventListener('click', handleFirstInteraction)
    window.addEventListener('touchstart', handleFirstInteraction)

    // Disable Context Menu (Right Click)
    const handleContextMenu = (e) => e.preventDefault()
    document.addEventListener('contextmenu', handleContextMenu)

    // Block keyboard shortcuts (DevTools, Reload, Back)
    const handleKeyDown = (e) => {
      // F12, F5
      if (e.key === 'F12' || e.key === 'F5') {
        e.preventDefault()
      }
      // Ctrl combinations (DevTools, Print, Source, Reload, Zoom)
      if (e.ctrlKey) {
        if (['I', 'J', 'U', 'P', 'R', '+', '-', '0'].includes(e.key.toUpperCase())) {
          e.preventDefault()
        }
      }
      // Alt + Left Arrow (Back)
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault()
      }
    }
    document.addEventListener('keydown', handleKeyDown)

    // Prevent pinch zoom and double tap zoom on mobile/touch
    const handleTouchMove = (e) => {
      if (e.touches.length > 1) {
        e.preventDefault()
      }
    }
    document.addEventListener('touchmove', handleTouchMove, { passive: false })

    // Hide cursor when idle for 3 seconds
    let cursorTimeout
    const handleMouseMove = () => {
      document.body.style.cursor = 'default'
      clearTimeout(cursorTimeout)
      cursorTimeout = setTimeout(() => {
        document.body.style.cursor = 'none'
      }, 3000)
    }
    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('click', handleFirstInteraction)
      window.removeEventListener('touchstart', handleFirstInteraction)
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('mousemove', handleMouseMove)
      clearTimeout(cursorTimeout)
      document.body.style.cursor = 'default'
    }
  }, [])
}
