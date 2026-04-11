import { useCallback, useEffect, useRef } from 'react'

export type DeliveryWindowCalendarDayPopoverState = {
  dayKey: string
  kind: 'windows' | 'closed-warning'
}

export const useDeliveryWindowCalendarDayPopoverActions = ({
  isBlocked,
  setActivePopover,
}: {
  isBlocked: boolean
  setActivePopover: (state: DeliveryWindowCalendarDayPopoverState | null) => void
}) => {
  const closeTimerRef = useRef<number | null>(null)
  const openTimerRef = useRef<number | null>(null)
  const suppressOpenUntilRef = useRef(0)

  const clearOpenTimer = useCallback(() => {
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current)
      openTimerRef.current = null
    }
  }, [])

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      clearCloseTimer()
      clearOpenTimer()
    }
  }, [clearCloseTimer, clearOpenTimer])

  const openWindowsPopover = useCallback(
    (dayKey: string) => {
      if (isBlocked) {
        return
      }
      if (Date.now() < suppressOpenUntilRef.current) {
        return
      }
      clearCloseTimer()
      clearOpenTimer()
      openTimerRef.current = window.setTimeout(() => {
        if (isBlocked) {
          return
        }
        if (Date.now() < suppressOpenUntilRef.current) {
          return
        }
        setActivePopover({ dayKey, kind: 'windows' })
      }, 90)
    },
    [clearCloseTimer, clearOpenTimer, isBlocked, setActivePopover],
  )

  const openClosedWarningPopover = useCallback(
    (dayKey: string) => {
      clearCloseTimer()
      clearOpenTimer()
      setActivePopover({ dayKey, kind: 'closed-warning' })
    },
    [clearCloseTimer, clearOpenTimer, setActivePopover],
  )

  const scheduleClose = useCallback(() => {
    clearCloseTimer()
    clearOpenTimer()
    closeTimerRef.current = window.setTimeout(() => {
      setActivePopover(null)
      closeTimerRef.current = null
    }, 120)
  }, [clearCloseTimer, clearOpenTimer, setActivePopover])

  const closePopoverNow = useCallback(() => {
    clearCloseTimer()
    clearOpenTimer()
    setActivePopover(null)
  }, [clearCloseTimer, clearOpenTimer, setActivePopover])

  const markSelectionInteraction = useCallback(() => {
    clearOpenTimer()
    clearCloseTimer()
    suppressOpenUntilRef.current = Date.now() + 220
  }, [clearCloseTimer, clearOpenTimer])

  return {
    openWindowsPopover,
    openClosedWarningPopover,
    scheduleClose,
    clearCloseTimer,
    closePopoverNow,
    markSelectionInteraction,
  }
}
