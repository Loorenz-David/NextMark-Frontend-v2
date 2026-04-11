import { useEffect, useId, useMemo, useRef, useState } from 'react'

const CLOSE_DELAY_MS = 150

const resolveTouchMode = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }

  return window.matchMedia('(hover: none)').matches
}

export const useInfoHoverController = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isTriggerHovered, setIsTriggerHovered] = useState(false)
  const [isOverlayHovered, setIsOverlayHovered] = useState(false)
  const [isTriggerFocused, setIsTriggerFocused] = useState(false)
  const [isOverlayFocused, setIsOverlayFocused] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pointerEventRef = useRef(false)
  const pointerEventTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const popoverId = useId()
  const isTouchMode = useMemo(resolveTouchMode, [])

  const clearCloseTimer = () => {
    if (!closeTimerRef.current) {
      return
    }

    clearTimeout(closeTimerRef.current)
    closeTimerRef.current = null
  }

  const closeNow = () => {
    clearCloseTimer()
    setIsOpen(false)
  }

  const scheduleClose = () => {
    clearCloseTimer()
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false)
      closeTimerRef.current = null
    }, CLOSE_DELAY_MS)
  }

  const openNow = () => {
    clearCloseTimer()
    setIsOpen(true)
  }

  useEffect(() => {
    const shouldRemainOpen = (
      isTriggerHovered
      || isOverlayHovered
      || isTriggerFocused
      || isOverlayFocused
    )

    if (shouldRemainOpen) {
      openNow()
      return
    }

    if (!isTouchMode) {
      scheduleClose()
    }
  }, [
    isOverlayFocused,
    isOverlayHovered,
    isTouchMode,
    isTriggerFocused,
    isTriggerHovered,
  ])

  useEffect(() => {
    return () => {
      clearCloseTimer()
    }
  }, [])

  useEffect(() => {
    const handlePointerEvent = () => {
      pointerEventRef.current = true
      if (pointerEventTimerRef.current) {
        clearTimeout(pointerEventTimerRef.current)
      }
      pointerEventTimerRef.current = setTimeout(() => {
        pointerEventRef.current = false
        pointerEventTimerRef.current = null
      }, 100)
    }

    window.addEventListener('pointerdown', handlePointerEvent)
    return () => {
      window.removeEventListener('pointerdown', handlePointerEvent)
      if (pointerEventTimerRef.current) {
        clearTimeout(pointerEventTimerRef.current)
      }
    }
  }, [])

  return {
    isOpen,
    popoverId,
    isTouchMode,
    setIsOpen,
    closeNow,
    openNow,
    clearCloseTimer,
    scheduleClose,
    triggerEvents: {
      onMouseEnter: () => {
        setIsTriggerHovered(true)
        clearCloseTimer()
      },
      onMouseLeave: () => {
        setIsTriggerHovered(false)
        scheduleClose()
      },
      onFocus: () => {
        if (isTouchMode || pointerEventRef.current) {
          return
        }
        setIsTriggerFocused(true)
        clearCloseTimer()
      },
      onBlur: () => {
        setIsTriggerFocused(false)
        scheduleClose()
      },
    },
    overlayEvents: {
      onMouseEnter: () => {
        setIsOverlayHovered(true)
        clearCloseTimer()
      },
      onMouseLeave: () => {
        setIsOverlayHovered(false)
        scheduleClose()
      },
      onFocus: () => {
        setIsOverlayFocused(true)
        clearCloseTimer()
      },
      onBlur: () => {
        setIsOverlayFocused(false)
        scheduleClose()
      },
    },
  }
}

