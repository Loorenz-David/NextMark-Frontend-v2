import { useCallback, useEffect, useRef } from 'react'

import type { DesktopPlanViewMode } from '../hooks/useHomeDesktopLayout'
import { usePrefersReducedMotionFlow } from './prefersReducedMotion.flow'

type RailLayoutDeps = {
  viewMode: DesktopPlanViewMode
  planColumnWidth: number | string
  mapRowHeight: number
  planRowHeight: number
  hasOverlay: boolean
  isOrderOverlayOpen: boolean
  isPlanVisible: boolean
  isMapVisible: boolean
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
  const prefersReducedMotionRef = usePrefersReducedMotionFlow()
  // While the map column slides back open it is still ~0px wide on the first
  // frame; reframing then would fit the viewport to nothing. Hold the reframe
  // until the grid transition ends. Reduced motion disables the transition
  // (no transitionend fires), so the hold is skipped there.
  const revealPendingRef = useRef(false)
  const previousMapVisibleRef = useRef(layoutDeps.isMapVisible)

  useEffect(() => {
    const wasVisible = previousMapVisibleRef.current
    previousMapVisibleRef.current = layoutDeps.isMapVisible
    if (!wasVisible && layoutDeps.isMapVisible && !prefersReducedMotionRef.current) {
      revealPendingRef.current = true
    }
  }, [layoutDeps.isMapVisible, prefersReducedMotionRef])

  const settleNow = useCallback(() => {
    resize()
    if (revealPendingRef.current) return
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
    layoutDeps.isMapVisible,
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
    revealPendingRef.current = false
    settleNow()
  }, [settleNow])

  return {
    handleRailLayoutChange,
    handleRailTransitionEnd,
  }
}
