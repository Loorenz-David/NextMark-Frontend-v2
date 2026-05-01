import { useMemo, useState } from 'react'
import type { DraggableAttributes } from '@dnd-kit/core'

import { BoldArrowIcon } from '@/assets/icons'

import {
  MAX_GROUP_CHILDREN_RENDER,
  type OrderAddressGroup,
} from '../../domain/orderAddressGroup.flow'
import type { Order } from '../../types/order'
import { OrderAddressGroupChildren } from '../lists/OrderAddressGroupChildren'

type OrderAddressGroupCardProps = {
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
  dragAttributes?: DraggableAttributes
  dragListeners?: any
}

export const OrderAddressGroupCard = ({
  group,
  expanded,
  isGroupHovered = false,
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
  dragAttributes,
  dragListeners,
}: OrderAddressGroupCardProps) => {
  const [showAllChildren, setShowAllChildren] = useState(false)

  const hasRenderCap = group.orders.length > MAX_GROUP_CHILDREN_RENDER
  const visibleOrders = useMemo(() => {
    if (!hasRenderCap || showAllChildren) return group.orders
    return group.orders.slice(0, MAX_GROUP_CHILDREN_RENDER)
  }, [group.orders, hasRenderCap, showAllChildren])

  return (
    <div className={`flex flex-col border-y-1 transition-all duration-200 ${
      isGroupHovered
        ? 'border-y-[rgb(var(--color-light-blue-r),0.7)] bg-white/[0.08] shadow-[0_18px_42px_rgba(45,95,170,0.18)]'
        : 'border-y-[var(--color-muted)]/60'
    }`}
    >
      <div className="py-4 pr-4 pl-2 z-2">
        <div
          className="flex cursor-pointer items-center gap-3"
          onClick={onToggleExpanded}
          {...dragAttributes}
          {...dragListeners}
        >
          <div className={`flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-sm font-semibold text-[var(--color-page)] transition-all duration-200 ${
            isGroupHovered
              ? 'bg-[var(--color-light-blue)] shadow-[0_0_0_3px_rgba(255,255,255,0.08)]'
              : 'bg-[var(--color-primary)]/60'
          }`}>
            {group.orders.length}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[var(--color-text)]">{group.label}</p>
            <p className="text-xs text-[var(--color-muted)]">Grouped orders</p>
          </div>
          <BoldArrowIcon
            className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-90' : 'rotate-0'}`}
          />
        </div>

      </div>
      {expanded ? (
          <>
            <OrderAddressGroupChildren
              orders={visibleOrders}
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
            />
            {hasRenderCap && !showAllChildren ? (
              <button
                type="button"
                className="mt-3 text-xs font-medium text-[var(--color-primary)] underline"
                onClick={(event) => {
                  event.stopPropagation()
                  setShowAllChildren(true)
                }}
              >
                Show all ({group.orders.length})
              </button>
            ) : null}
          </>
        ) : null}
    </div>
  )
}
