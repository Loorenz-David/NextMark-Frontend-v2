import { useCallback, useEffect, useRef } from 'react'

import type { DesktopPlanViewMode } from '../hooks/useHomeDesktopLayout'

type RailLayoutDeps = {
  viewMode: DesktopPlanViewMode
  planColumnWidth: number
  mapRowHeight: number
  planRowHeight: number
  hasOverlay: boolean
  isOrderOverlayOpen: boolean
  isPlanVisible: boolean
}

type HomeDesktopRailSettleFlowParams = {
  layoutDeps: RailLayoutDeps
  resize: () => void
  reframeToVisibleArea: () => void
  shouldReframeToVisibleArea?: () => boolean
}

export const buildRafSettleScheduler = (
  requestFrame: (callback: FrameRequestCallback) => number,
  settle: () => void,
) => {
  let frameId: number | null = null

  return () => {
    if (frameId !== null) return
    frameId = requestFrame(() => {
      frameId = null
      settle()
    })
  }
}

export const useHomeDesktopRailSettleFlow = ({
  layoutDeps,
  resize,
  reframeToVisibleArea,
  shouldReframeToVisibleArea,
}: HomeDesktopRailSettleFlowParams) => {
  const rafRef = useRef<number | null>(null)

  const settleNow = useCallback(() => {
    resize()
    if (shouldReframeToVisibleArea?.() ?? true) {
      reframeToVisibleArea()
    }
  }, [reframeToVisibleArea, resize, shouldReframeToVisibleArea])

  const scheduleSettle = useCallback(() => {
    if (rafRef.current !== null) return
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null
      settleNow()
    })
  }, [settleNow])

  useEffect(() => {
    scheduleSettle()
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [
    layoutDeps.hasOverlay,
    layoutDeps.isOrderOverlayOpen,
    layoutDeps.isPlanVisible,
    layoutDeps.mapRowHeight,
    layoutDeps.planColumnWidth,
    layoutDeps.planRowHeight,
    layoutDeps.viewMode,
    scheduleSettle,
  ])

  const handleRailLayoutChange = useCallback(() => {
    scheduleSettle()
  }, [scheduleSettle])

  const handleRailTransitionEnd = useCallback(() => {
    settleNow()
  }, [settleNow])

  return {
    handleRailLayoutChange,
    handleRailTransitionEnd,
  }
}
