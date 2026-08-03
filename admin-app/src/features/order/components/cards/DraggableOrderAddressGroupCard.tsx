import { useDraggable } from '@dnd-kit/core'

import type { Order } from '../../types/order'
import type { OrderAddressGroup } from '../../domain/orderAddressGroup.flow'
import { OrderAddressGroupCard } from '../cards/OrderAddressGroupCard'

type DraggableOrderAddressGroupCardProps = {
  group: OrderAddressGroup
  expanded: boolean
  isGroupHovered?: boolean
  onToggleExpanded: () => void
  isSelectionMode: boolean
  isOrderSelected?: (order: Order) => boolean
  onToggleSelection?: (order: Order) => void
  onOpenOrder?: (order: Order) => void
  onArchive?: (order: Order) => void
  onUnarchive?: (order: Order) => void
  hoveredClientId?: string | null
  hoveredClientIds?: string[]
  onOrderMouseEnter?: (order: Order) => void
  onOrderMouseLeave?: () => void
}

export const DraggableOrderAddressGroupCard = ({
  group,
  expanded,
  isGroupHovered,
  onToggleExpanded,
  isSelectionMode,
  isOrderSelected,
  onToggleSelection,
  onOpenOrder,
  onArchive,
  onUnarchive,
  hoveredClientId,
  hoveredClientIds,
  onOrderMouseEnter,
  onOrderMouseLeave,
}: DraggableOrderAddressGroupCardProps) => {
  const representativeOrder = group.orders[0]

  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
  } = useDraggable({
    id: `order_group:${group.key}`,
    data: {
      type: 'order_group',
      groupKey: group.key,
      label: group.label,
      orderIds: group.orderIds,
      orderClientIds: group.orders.map((order) => order.client_id),
      orderCount: group.orders.length,
      order: representativeOrder,
    },
  })

  // The DragOverlay tracks the pointer; the source only hides in place. See
  // DraggableOrderCard for why applying the transform here paints a mirror.
  // Wrapper `opacity` hides on the same frame; `visibility` alone would be
  // animated by the card body's `transition-all` (see DraggableOrderCard).
  const style: React.CSSProperties = {
    opacity: isDragging ? 0 : 1,
    visibility: isDragging ? 'hidden' : 'visible',
    pointerEvents: isDragging ? 'none' : undefined,
    cursor: 'grab',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onMouseEnter={() => {
        if (representativeOrder) {
          onOrderMouseEnter?.(representativeOrder)
        }
      }}
      onMouseLeave={() => onOrderMouseLeave?.()}
    >
      <OrderAddressGroupCard
        group={group}
        expanded={expanded}
        isGroupHovered={isGroupHovered}
        onToggleExpanded={onToggleExpanded}
        isSelectionMode={isSelectionMode}
        isOrderSelected={isOrderSelected}
        onToggleSelection={onToggleSelection}
        onOpenOrder={onOpenOrder}
        onArchive={onArchive}
        onUnarchive={onUnarchive}
        hoveredClientId={hoveredClientId}
        hoveredClientIds={hoveredClientIds}
        onOrderMouseEnter={onOrderMouseEnter}
        onOrderMouseLeave={onOrderMouseLeave}
        dragAttributes={attributes}
        dragListeners={listeners}
      />
    </div>
  )
}
