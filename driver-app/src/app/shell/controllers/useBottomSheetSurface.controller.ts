import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { DRIVER_SHELL_CONFIG } from '../domain/shell.config'
import {
  isScrollContainerAtBottom,
  isScrollContainerAtTop,
  resolveBottomSheetContentScrollContainer,
  shouldIgnoreBottomSheetContentGesture,
} from '../domain/bottomSheetContentGesture'
import { useRouteExecutionShell } from '@/features/route-execution/providers/routeExecutionShell.context'
import { useDriverAppShell } from '../providers/driverAppShell.context'
import { selectBottomSheetState } from '../stores/shell.selectors'

const SNAP_STEPS = [
  { snap: 'collapsed', percent: DRIVER_SHELL_CONFIG.bottomSheet.snapHeights.collapsed },
  { snap: 'workspace', percent: DRIVER_SHELL_CONFIG.bottomSheet.snapHeights.workspace },
  { snap: 'expanded', percent: DRIVER_SHELL_CONFIG.bottomSheet.snapHeights.expanded },
] as const

const DIRECTION_LOCK_THRESHOLD_PX = DRIVER_SHELL_CONFIG.bottomSheet.directionLockThresholdPx
const CONTENT_DRAG_ACTIVATION_THRESHOLD_PX = DRIVER_SHELL_CONFIG.bottomSheet.contentDragActivationThresholdPx
const CONTENT_DRAG_DIRECTION_BIAS_PX = DRIVER_SHELL_CONFIG.bottomSheet.contentDragDirectionBiasPx
const SNAP_ANIMATION_MS = DRIVER_SHELL_CONFIG.bottomSheet.snapAnimationMs

type DragDirection = 'up' | 'down' | null
type TouchGestureState = {
  touchId: number
  startX: number
  startY: number
  direction: DragDirection
  scrollContainer: HTMLElement | null
  startedAtTop: boolean
  startedAtBottom: boolean
  isTakeoverActive: boolean
  isLockedOut: boolean
}

export function useBottomSheetSurfaceController() {
  const { closeRouteSearch, routeViewMode } = useRouteExecutionShell()
  const {
    store,
    setBottomSheetHeight,
    setBottomSheetMotionState,
    setBottomSheetSnap,
  } = useDriverAppShell()

  const shellState = useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState,
  )

  const bottomSheetState = useMemo(() => selectBottomSheetState(shellState), [shellState])
  const shellStateRef = useRef(shellState)
  const bottomSheetHeightPercentRef = useRef(bottomSheetState.heightPercent)

  useEffect(() => {
    shellStateRef.current = shellState
  }, [shellState])

  useEffect(() => {
    bottomSheetHeightPercentRef.current = bottomSheetState.heightPercent
  }, [bottomSheetState.heightPercent])

  const dragStateRef = useRef<{
    pointerId: number
    startY: number
    startPercent: number
    lastClientY: number
    direction: DragDirection
  } | null>(null)
  const pointerDragTargetRef = useRef<HTMLElement | null>(null)
  const touchGestureStateRef = useRef<TouchGestureState | null>(null)
  const snapAnimationTimeoutRef = useRef<number | null>(null)

  const clearSnapAnimationTimeout = useCallback(() => {
    if (snapAnimationTimeoutRef.current !== null) {
      window.clearTimeout(snapAnimationTimeoutRef.current)
      snapAnimationTimeoutRef.current = null
    }
  }, [])

  const scheduleSnapAnimationIdle = useCallback(() => {
    clearSnapAnimationTimeout()
    snapAnimationTimeoutRef.current = window.setTimeout(() => {
      setBottomSheetMotionState('idle')
      snapAnimationTimeoutRef.current = null
    }, SNAP_ANIMATION_MS)
  }, [clearSnapAnimationTimeout, setBottomSheetMotionState])

  const beginDrag = useCallback((startY: number, startPercent: number) => {
    clearSnapAnimationTimeout()
    setBottomSheetMotionState('dragging')

    dragStateRef.current = {
      pointerId: -1,
      startY,
      startPercent,
      lastClientY: startY,
      direction: null,
    }
  }, [clearSnapAnimationTimeout, setBottomSheetMotionState])

  const updateHeightFromPointer = useCallback((clientY: number) => {
    if (!dragStateRef.current) {
      return
    }

    const deltaY = dragStateRef.current.startY - clientY
    const viewportHeight = window.innerHeight || 1
    const deltaPercent = (deltaY / viewportHeight) * 100
    const nextPercent = Math.max(
      DRIVER_SHELL_CONFIG.bottomSheet.snapHeights.collapsed,
      Math.min(
        DRIVER_SHELL_CONFIG.bottomSheet.snapHeights.expanded,
        dragStateRef.current.startPercent + deltaPercent,
      ),
    )
    bottomSheetHeightPercentRef.current = nextPercent
    setBottomSheetHeight(nextPercent)
  }, [setBottomSheetHeight])

  const canTakeOverDrag = useCallback((dragDirection: Exclude<DragDirection, null>) => {
    if (shellStateRef.current.surfaceFocus !== 'bottom-sheet') {
      return false
    }

    if (dragDirection === 'down') {
      return bottomSheetHeightPercentRef.current > DRIVER_SHELL_CONFIG.bottomSheet.snapHeights.collapsed
    }

    return bottomSheetHeightPercentRef.current < DRIVER_SHELL_CONFIG.bottomSheet.snapHeights.expanded
  }, [])

  const commitNearestSnap = useCallback((dragDirection: DragDirection) => {
    const currentPercent = bottomSheetHeightPercentRef.current
    const currentPage = shellStateRef.current.bottomSheetStack.at(-1) ?? null
    const shouldCloseSearchOnSnapDown = (
      dragDirection === 'down'
      && currentPage?.page === 'route-workspace'
      && routeViewMode === 'search'
    )

    if (dragDirection === 'up') {
      const upwardStep = SNAP_STEPS.find((step) => step.percent >= currentPercent) ?? SNAP_STEPS.at(-1) ?? SNAP_STEPS[0]
      setBottomSheetSnap(upwardStep.snap)
      return
    }

    if (dragDirection === 'down') {
      const downwardSteps = [...SNAP_STEPS].reverse()
      const downwardStep = downwardSteps.find((step) => step.percent <= currentPercent) ?? SNAP_STEPS[0]

      if (shouldCloseSearchOnSnapDown && downwardStep.snap !== 'expanded') {
        closeRouteSearch()
      }

      setBottomSheetSnap(downwardStep.snap)
      return
    }

    const nearest = SNAP_STEPS.reduce((closest, step) => (
      Math.abs(step.percent - currentPercent) < Math.abs(closest.percent - currentPercent)
        ? step
        : closest
    ), SNAP_STEPS[0])

    setBottomSheetSnap(nearest.snap)
  }, [closeRouteSearch, routeViewMode, setBottomSheetSnap])

  const finishDrag = useCallback((dragDirection: DragDirection) => {
    dragStateRef.current = null
    setBottomSheetMotionState('snapping')
    commitNearestSnap(dragDirection)
    scheduleSnapAnimationIdle()
  }, [commitNearestSnap, scheduleSnapAnimationIdle, setBottomSheetMotionState])

  const cancelDragToNearestSnap = useCallback(() => {
    const dragDirection = dragStateRef.current?.direction ?? null
    dragStateRef.current = null
    setBottomSheetMotionState('snapping')
    commitNearestSnap(dragDirection)
    scheduleSnapAnimationIdle()
  }, [commitNearestSnap, scheduleSnapAnimationIdle, setBottomSheetMotionState])

  const releasePointerCapture = useCallback((pointerId: number) => {
    const target = pointerDragTargetRef.current
    pointerDragTargetRef.current = null

    if (target?.hasPointerCapture(pointerId)) {
      target.releasePointerCapture(pointerId)
    }
  }, [])

  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    beginDrag(event.clientY, bottomSheetState.heightPercent)
    if (dragStateRef.current) {
      dragStateRef.current.pointerId = event.pointerId
    }
    pointerDragTargetRef.current = event.currentTarget

    event.currentTarget.setPointerCapture(event.pointerId)
  }, [beginDrag, bottomSheetState.heightPercent])

  useEffect(() => {
    const handleWindowPointerMove = (event: PointerEvent) => {
      if (!dragStateRef.current || dragStateRef.current.pointerId !== event.pointerId) {
        return
      }

      const movementDelta = dragStateRef.current.lastClientY - event.clientY
      if (Math.abs(movementDelta) >= DIRECTION_LOCK_THRESHOLD_PX) {
        dragStateRef.current.direction = movementDelta > 0 ? 'up' : 'down'
      }
      dragStateRef.current.lastClientY = event.clientY
      updateHeightFromPointer(event.clientY)
    }

    const finishPointerSession = (event: PointerEvent) => {
      if (!dragStateRef.current || dragStateRef.current.pointerId !== event.pointerId) {
        return
      }

      const dragDirection = dragStateRef.current.direction
      releasePointerCapture(event.pointerId)
      finishDrag(dragDirection)
    }

    const cancelPointerSession = (event: PointerEvent) => {
      if (!dragStateRef.current || dragStateRef.current.pointerId !== event.pointerId) {
        return
      }

      releasePointerCapture(event.pointerId)
      cancelDragToNearestSnap()
    }

    window.addEventListener('pointermove', handleWindowPointerMove)
    window.addEventListener('pointerup', finishPointerSession)
    window.addEventListener('pointercancel', cancelPointerSession)
    window.addEventListener('blur', cancelDragToNearestSnap)

    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove)
      window.removeEventListener('pointerup', finishPointerSession)
      window.removeEventListener('pointercancel', cancelPointerSession)
      window.removeEventListener('blur', cancelDragToNearestSnap)
    }
  }, [cancelDragToNearestSnap, finishDrag, releasePointerCapture, updateHeightFromPointer])

  const handleContentTouchStart = useCallback((
    event: TouchEvent,
    contentRoot: HTMLDivElement | null,
  ) => {
    if (shellStateRef.current.surfaceFocus !== 'bottom-sheet' || event.touches.length !== 1) {
      touchGestureStateRef.current = null
      return
    }

    const touch = event.touches[0]
    const isLockedOut = shouldIgnoreBottomSheetContentGesture(event.target, contentRoot)

    touchGestureStateRef.current = {
      touchId: touch.identifier,
      startX: touch.clientX,
      startY: touch.clientY,
      direction: null,
      scrollContainer: isLockedOut
        ? null
        : resolveBottomSheetContentScrollContainer(event.target, contentRoot),
      startedAtTop: false,
      startedAtBottom: false,
      isTakeoverActive: false,
      isLockedOut,
    }

    if (touchGestureStateRef.current?.scrollContainer) {
      touchGestureStateRef.current.startedAtTop = isScrollContainerAtTop(touchGestureStateRef.current.scrollContainer)
      touchGestureStateRef.current.startedAtBottom = isScrollContainerAtBottom(touchGestureStateRef.current.scrollContainer)
    }
  }, [])

  const handleContentTouchMove = useCallback((event: TouchEvent) => {
    const gestureState = touchGestureStateRef.current
    if (!gestureState) {
      return
    }

    const touch = Array.from(event.touches).find((candidate) => candidate.identifier === gestureState.touchId)
    if (!touch) {
      return
    }

    if (gestureState.isLockedOut) {
      return
    }

    const deltaX = touch.clientX - gestureState.startX
    const deltaY = touch.clientY - gestureState.startY

    if (!gestureState.isTakeoverActive) {
      if (
        Math.abs(deltaY) <= CONTENT_DRAG_ACTIVATION_THRESHOLD_PX
        || Math.abs(deltaY) <= Math.abs(deltaX) + CONTENT_DRAG_DIRECTION_BIAS_PX
      ) {
        return
      }

      const nextDirection: Exclude<DragDirection, null> = deltaY < 0 ? 'up' : 'down'
      const scrollContainer = gestureState.scrollContainer

      if (scrollContainer) {
        const startedAtRelevantEdge = nextDirection === 'down'
          ? gestureState.startedAtTop
          : gestureState.startedAtBottom

        if (!startedAtRelevantEdge) {
          return
        }
      }

      if (!canTakeOverDrag(nextDirection)) {
        gestureState.isLockedOut = true
        return
      }

      if (scrollContainer) {
        scrollContainer.scrollTop = nextDirection === 'down'
          ? 0
          : Math.max(0, scrollContainer.scrollHeight - scrollContainer.clientHeight)
      }

      gestureState.isTakeoverActive = true
      gestureState.direction = nextDirection
      beginDrag(gestureState.startY, bottomSheetHeightPercentRef.current)
    }

    event.preventDefault()

    if (dragStateRef.current) {
      const movementDelta = dragStateRef.current.lastClientY - touch.clientY
      if (Math.abs(movementDelta) >= DIRECTION_LOCK_THRESHOLD_PX) {
        dragStateRef.current.direction = movementDelta > 0 ? 'up' : 'down'
        gestureState.direction = dragStateRef.current.direction
      }
      dragStateRef.current.lastClientY = touch.clientY
    }

    updateHeightFromPointer(touch.clientY)
  }, [
    beginDrag,
    canTakeOverDrag,
    updateHeightFromPointer,
  ])

  const handleContentTouchEnd = useCallback(() => {
    const gestureState = touchGestureStateRef.current
    touchGestureStateRef.current = null

    if (!gestureState?.isTakeoverActive) {
      return
    }

    finishDrag(gestureState.direction)
  }, [finishDrag])

  const handleContentTouchCancel = useCallback(() => {
    const gestureState = touchGestureStateRef.current
    touchGestureStateRef.current = null

    if (!gestureState?.isTakeoverActive) {
      return
    }

    cancelDragToNearestSnap()
  }, [cancelDragToNearestSnap])

  return useMemo(() => ({
    ...bottomSheetState,
    handleContentTouchCancel,
    handleContentTouchEnd,
    handleContentTouchMove,
    handleContentTouchStart,
    handlePointerDown,
  }), [
    bottomSheetState,
    handleContentTouchCancel,
    handleContentTouchEnd,
    handleContentTouchMove,
    handleContentTouchStart,
    handlePointerDown,
  ])
}
