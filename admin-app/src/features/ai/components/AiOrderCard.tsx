import { memo, useCallback, useMemo, type KeyboardEvent } from 'react'

import { ItemIcon } from '@/assets/icons'
import { OrderOperationTypeBadges } from '@/features/order/components/cards/OrderOperationTypeBadges'
import { useOrderStateByServerId } from '@/features/order/store/orderStateHooks.store'
import { StateCard } from '@/shared/layout/StateCard'
import type { Order } from '@shared-domain'

interface AiOrderCardProps {
  order: Order
  onRowClick?: (order: Order) => void
}

function areOrdersEquivalent(prevOrder: Order, nextOrder: Order): boolean {
  return prevOrder.order_scalar_id === nextOrder.order_scalar_id
    && prevOrder.total_items === nextOrder.total_items
    && prevOrder.order_state_id === nextOrder.order_state_id
    && prevOrder.operation_type === nextOrder.operation_type
    && prevOrder.external_source === nextOrder.external_source
    && prevOrder.client_address?.street_address === nextOrder.client_address?.street_address
}

// Standalone AI-context order card.
// Must NOT depend on OrderCard — that component uses OrderMissingInfoNotifier
// which requires ResourcesManagerProvider, unavailable inside the AI panel portal.
function AiOrderCardComponent({ order, onRowClick }: AiOrderCardProps) {
  const orderLabel = useMemo(
    () => (order.order_scalar_id != null ? `#${order.order_scalar_id}` : '#—'),
    [order.order_scalar_id],
  )
  const streetAddress = useMemo(
    () => order.client_address?.street_address ?? 'No address',
    [order.client_address?.street_address],
  )
  const itemCount = useMemo(() => order.total_items ?? 0, [order.total_items])
  const orderState = useOrderStateByServerId(order.order_state_id ?? null)
  const isInteractive = typeof onRowClick === 'function'

  const handleCardClick = useCallback(() => {
    onRowClick?.(order)
  }, [onRowClick, order])

  const handleCardKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (!onRowClick) {
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onRowClick(order)
    }
  }, [onRowClick, order])

  return (
    <div
      aria-label={isInteractive ? `Open order ${orderLabel} details` : undefined}
      className={`admin-glass-panel admin-surface-compact relative flex flex-col gap-2.5 overflow-hidden rounded-lg border-white/10 p-4 ${isInteractive ? 'cursor-pointer transition-colors hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-light-blue)]/60' : ''}`.trim()}
      onClick={isInteractive ? handleCardClick : undefined}
      onKeyDown={isInteractive ? handleCardKeyDown : undefined}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent_30%,transparent_72%,rgba(0,0,0,0.04))]" />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-base font-semibold text-[var(--color-text)]">{orderLabel}</span>
          <OrderOperationTypeBadges operationType={order.operation_type} />
          {order.external_source && (
            <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.16em] text-[var(--color-muted)]">
              {order.external_source}
            </span>
          )}
        </div>
        {orderState && (
          <StateCard label={orderState.name} color={orderState.color ?? '#363636'} />
        )}
      </div>

      <div className="relative z-10 flex items-center justify-between gap-3 text-xs text-[var(--color-muted)]">
        <span className="truncate text-xs text-[var(--color-muted)]/95">{streetAddress}</span>
        <div className="flex shrink-0 items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-2 py-1">
          <ItemIcon className="h-3 w-3 text-[var(--color-primary)]/85" />
          <span>{itemCount}</span>
        </div>
      </div>
    </div>
  )
}

export const AiOrderCard = memo(
  AiOrderCardComponent,
  (prev, next) => areOrdersEquivalent(prev.order, next.order) && prev.onRowClick === next.onRowClick,
)
