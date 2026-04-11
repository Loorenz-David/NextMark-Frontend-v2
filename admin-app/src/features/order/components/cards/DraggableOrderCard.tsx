import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

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
}: DraggableOrderCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: order.client_id,
    data: {
      type: 'order',
      id: order.client_id,
      order,
    },
  })

  const style: {
    transform: string | undefined
    visibility: 'hidden' | 'visible'
    cursor: string
  } = {
    transform: CSS.Transform.toString(transform),
    visibility: isDragging ? 'hidden' : 'visible',
    cursor: isSelectionMode ? 'pointer' : 'grab',
  }

  return (
    <div
      ref={setNodeRef}
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
