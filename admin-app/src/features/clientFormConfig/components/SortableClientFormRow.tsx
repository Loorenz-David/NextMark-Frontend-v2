import type { ReactNode } from 'react'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { DragHandleIcon } from '@/assets/icons'

type SortableClientFormRowProps = {
  id: string
  disabled?: boolean
  /** Receives the handle to render — dragging is handle-only so the row's own controls stay clickable. */
  children: (dragHandle: ReactNode) => ReactNode
}

export const SortableClientFormRow = ({
  id,
  disabled = false,
  children,
}: SortableClientFormRowProps) => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled })

  const dragHandle = (
    <button
      ref={setActivatorNodeRef}
      type="button"
      aria-label="Reorder"
      disabled={disabled}
      className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-surface-raised text-[var(--color-muted)] ${
        disabled ? 'cursor-not-allowed opacity-40' : 'cursor-grab active:cursor-grabbing'
      }`}
      {...attributes}
      {...listeners}
    >
      <DragHandleIcon className="h-3.5 w-3.5" />
    </button>
  )

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
      }}
      className="w-full"
    >
      {children(dragHandle)}
    </div>
  )
}
