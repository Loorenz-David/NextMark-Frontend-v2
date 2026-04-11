import { useCallback, useEffect, useMemo, useState, type PointerEvent as ReactPointerEvent } from 'react'

import {
  clampFloatingPoint,
  computePanelOpenPosition,
  readPersistedLayout,
  readViewport,
  resolveDefaultLauncherPosition,
  writePersistedLayout,
} from '../layout'
import type { FloatingPoint, FloatingSize, FloatingViewport } from '../layout'

export type DragTarget = 'panel' | 'launcher'

type DragState = {
  target: DragTarget
  startPointer: FloatingPoint
  startPosition: FloatingPoint
  // For panel drag: offset from panel origin to launcher origin, frozen at drag start.
  // Prevents the above/below toggle in computePanelOpenPosition from firing mid-drag.
  panelToLauncherOffset?: FloatingPoint
}

interface UseAiPanelLayoutStateParams {
  storageKey: string
  viewportMargin: number
  mobileBreakpoint: number
  desktopSize: FloatingSize
  launcherSize: FloatingSize
  defaultOpen: boolean
}

interface AiPanelLayoutState {
  viewport: FloatingViewport
  isMobile: boolean
  isOpen: boolean
  isDragging: boolean
  setIsOpen: (next: boolean | ((current: boolean) => boolean)) => void
  panelPosition: FloatingPoint
  launcherPosition: FloatingPoint
  startDrag: (target: DragTarget) => (event: ReactPointerEvent<HTMLElement>) => void
}

export function useAiPanelLayoutState({
  storageKey,
  viewportMargin,
  mobileBreakpoint,
  desktopSize,
  launcherSize,
  defaultOpen,
}: UseAiPanelLayoutStateParams): AiPanelLayoutState {
  const initialViewport = readViewport()
  const persistedLayout = readPersistedLayout(storageKey)
  const initialLauncherPosition = clampFloatingPoint(
    persistedLayout?.launcherPosition ??
      resolveDefaultLauncherPosition(initialViewport, launcherSize, viewportMargin),
    launcherSize,
    initialViewport,
    viewportMargin,
  )

  const [viewport, setViewport] = useState(initialViewport)
  const [isOpen, setIsOpen] = useState(Boolean(persistedLayout?.isOpen ?? defaultOpen))
  const [launcherPosition, setLauncherPosition] = useState(initialLauncherPosition)
  const [dragState, setDragState] = useState<DragState | null>(null)

  const isMobile = viewport.width < mobileBreakpoint
  const isDragging = dragState !== null

  // Panel position is always derived from launcher position — no independent state.
  const panelPosition = useMemo(
    () =>
      computePanelOpenPosition(launcherPosition, launcherSize, desktopSize, viewport, viewportMargin),
    [launcherPosition, launcherSize, desktopSize, viewport, viewportMargin],
  )

  useEffect(() => {
    const handleResize = () => {
      const nextViewport = readViewport()
      setViewport(nextViewport)
      setLauncherPosition((current) =>
        clampFloatingPoint(current, launcherSize, nextViewport, viewportMargin),
      )
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [launcherSize, viewportMargin])

  useEffect(() => {
    if (!dragState || isMobile) {
      return
    }

    const handlePointerMove = (event: PointerEvent) => {
      const deltaX = event.clientX - dragState.startPointer.x
      const deltaY = event.clientY - dragState.startPointer.y

      if (dragState.target === 'panel' && dragState.panelToLauncherOffset) {
        // Move the panel directly by delta (clamped to panel bounds), then
        // back-derive launcher using the frozen offset — prevents above/below flip.
        const targetPanel = clampFloatingPoint(
          { x: dragState.startPosition.x + deltaX, y: dragState.startPosition.y + deltaY },
          desktopSize,
          viewport,
          viewportMargin,
        )
        setLauncherPosition(
          clampFloatingPoint(
            { x: targetPanel.x + dragState.panelToLauncherOffset.x, y: targetPanel.y + dragState.panelToLauncherOffset.y },
            launcherSize,
            viewport,
            viewportMargin,
          ),
        )
        return
      }

      setLauncherPosition(
        clampFloatingPoint(
          { x: dragState.startPosition.x + deltaX, y: dragState.startPosition.y + deltaY },
          launcherSize,
          viewport,
          viewportMargin,
        ),
      )
    }

    const handlePointerUp = () => {
      setDragState(null)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [dragState, isMobile, launcherSize, viewport, viewportMargin])

  useEffect(() => {
    writePersistedLayout(storageKey, {
      isOpen,
      launcherPosition,
    })
  }, [isOpen, launcherPosition, storageKey])

  const startDrag = useCallback(
    (target: DragTarget) => (event: ReactPointerEvent<HTMLElement>) => {
      if (isMobile) {
        return
      }
      event.preventDefault()
      if (target === 'panel') {
        setDragState({
          target,
          startPointer: { x: event.clientX, y: event.clientY },
          startPosition: panelPosition,
          panelToLauncherOffset: {
            x: launcherPosition.x - panelPosition.x,
            y: launcherPosition.y - panelPosition.y,
          },
        })
      } else {
        setDragState({
          target,
          startPointer: { x: event.clientX, y: event.clientY },
          startPosition: launcherPosition,
        })
      }
    },
    [isMobile, launcherPosition, panelPosition],
  )

  return {
    viewport,
    isMobile,
    isOpen,
    isDragging,
    setIsOpen,
    panelPosition,
    launcherPosition,
    startDrag,
  }
}
