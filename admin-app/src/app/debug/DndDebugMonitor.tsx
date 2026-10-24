// TEMPORARY dev-only: reports what dnd-kit itself decided during a drag.
import { useDndMonitor } from '@dnd-kit/core'

const push = (kind: string, data: Record<string, unknown>) => window.__dndDebug?.push(kind, data)

export function DndDebugMonitor() {
  useDndMonitor({
    onDragStart: ({ active, activatorEvent }) =>
      push('dnd:start', { active: String(active.id), activator: activatorEvent?.type ?? null }),
    onDragMove: ({ delta }) => {
      if (Math.abs(delta.x) + Math.abs(delta.y) < 40) push('dnd:move', { dx: Math.round(delta.x), dy: Math.round(delta.y) })
    },
    onDragOver: ({ over }) => push('dnd:over', { over: over ? String(over.id) : null }),
    onDragEnd: ({ over }) => push('dnd:end', { over: over ? String(over.id) : null }),
    onDragCancel: () => push('dnd:cancel', {}),
  })
  return null
}
