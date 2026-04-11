import { useRef, type PointerEvent as ReactPointerEvent } from 'react'

import { launcherLabelStyle, launcherStyle } from '../styles'
import type { AiPanelTheme } from '../types'

const DRAG_THRESHOLD_PX = 4

interface FloatingLauncherProps {
  label: string
  theme: AiPanelTheme
  position: { x: number; y: number }
  onOpen: () => void
  onDragStart: (event: ReactPointerEvent<HTMLElement>) => void
}

export function FloatingLauncher({
  label,
  theme,
  position,
  onOpen,
  onDragStart,
}: FloatingLauncherProps) {
  const launcherTheme = theme.launcher
  const pointerDownAt = useRef<{ x: number; y: number } | null>(null)
  const didDrag = useRef(false)

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    pointerDownAt.current = { x: event.clientX, y: event.clientY }
    didDrag.current = false
    onDragStart(event)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!pointerDownAt.current) return
    const dx = event.clientX - pointerDownAt.current.x
    const dy = event.clientY - pointerDownAt.current.y
    if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD_PX) {
      didDrag.current = true
    }
  }

  const handleClick = () => {
    if (didDrag.current) {
      didDrag.current = false
      return
    }
    onOpen()
  }

  return (
    <button
      aria-label="Open AI panel"
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      style={{
        ...launcherStyle(launcherTheme),
        left: position.x,
        top: position.y,
      }}
      type="button"
    >
      <span style={launcherLabelStyle(launcherTheme)}>{label}</span>
    </button>
  )
}
