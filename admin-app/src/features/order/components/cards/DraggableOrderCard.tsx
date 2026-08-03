import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { useDraggable } from '@dnd-kit/core'

import type { Order } from '@/features/order/types/order'


import { OrderCard } from './OrderCard'

type DraggableOrderCardProps = {
  order: Order
  isSelectionMode?: boolean
  isSelected?: boolean
  onToggleSelection?: (order: Order) => void
  onOpen?: (order: Order) => void
  onArchive?:(order: Order)=> void
  onUnarchive?: (order: Order) => void
  isHovered?: boolean
  onMouseEnter?: (order: Order) => void
  onMouseLeave?: () => void
  collapseSourceOnDrag?: boolean
}

type DragSourceRect = {
  top: number
  left: number
  width: number
  height: number
}

export const DraggableOrderCard = ({
  order,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelection,
  onOpen,
  onArchive,
  onUnarchive,
  isHovered = false,
  onMouseEnter,
  onMouseLeave,
  collapseSourceOnDrag = false,
}: DraggableOrderCardProps) => {
  const draggableNodeRef = useRef<HTMLDivElement | null>(null)
  const [dragSourceRect, setDragSourceRect] = useState<DragSourceRect | null>(null)
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
  } = useDraggable({
    id: order.client_id,
    data: {
      type: 'order',
      id: order.client_id,
      order,
    },
  })

  const handleNodeRef = useCallback((node: HTMLDivElement | null) => {
    draggableNodeRef.current = node
    setNodeRef(node)
  }, [setNodeRef])

  useLayoutEffect(() => {
    if (!isDragging || !collapseSourceOnDrag) {
      setDragSourceRect(null)
      return
    }

    const rect = draggableNodeRef.current?.getBoundingClientRect()
    if (!rect) return

    setDragSourceRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    })
  }, [collapseSourceOnDrag, isDragging])

  const collapseStyle: CSSProperties =
    isDragging && collapseSourceOnDrag && dragSourceRect
      ? {
          position: 'fixed',
          top: dragSourceRect.top,
          left: dragSourceRect.left,
          width: dragSourceRect.width,
          height: dragSourceRect.height,
        }
      : {}

  // The pointer is tracked by the DragOverlay, never by the source card. The
  // card body transitions `visibility` (inherited via its `transition-all`
  // panel class), so during that transition it is still visible — applying the
  // drag transform here would send a full-size mirror of the card along the
  // pointer track for the duration. The source only hides in place.
  // Hidden via wrapper `opacity`, not `visibility` alone: visibility inherits,
  // and the card body's `transition-all` animates the inherited flip — leaving
  // the card visible for the transition's duration. Opacity is a compositing
  // property on this wrapper alone, so the hide lands on the same frame.
  const style: CSSProperties = {
    opacity: isDragging ? 0 : 1,
    visibility: isDragging ? 'hidden' : 'visible',
    pointerEvents: isDragging ? 'none' : undefined,
    cursor: isSelectionMode ? 'pointer' : 'grab',
    ...collapseStyle,
  }

  return (
    <div
      ref={handleNodeRef}
      style={style}
      className="relative"
      onClick={isSelectionMode ? () => onToggleSelection?.(order) : undefined}
      onMouseEnter={() => onMouseEnter?.(order)}
      onMouseLeave={() => onMouseLeave?.()}
      {...attributes}
      {...listeners}
    >
      {isSelectionMode ? (
        <button
          type="button"
          className={`absolute left-1 top-1 z-20 h-5 w-5 rounded-full border text-[10px] font-semibold ${
            isSelected
              ? 'border-[var(--color-light-blue)] bg-[var(--color-dark-blue)] text-white'
              : 'border-[var(--color-border)] bg-white text-[var(--color-muted)]'
          }`}
          onClick={(event) => {
            event.stopPropagation()
            onToggleSelection?.(order)
          }}
          aria-label={isSelected ? 'Unselect order' : 'Select order'}
        >
          {isSelected ? '✓' : ''}
        </button>
      ) : null}
      <OrderCard
        order={order}
        onOpen={onOpen}
        onArchive={onArchive}
        onUnarchive={onUnarchive}
        isHovered={isHovered}
      />
    </div>
  )
}
