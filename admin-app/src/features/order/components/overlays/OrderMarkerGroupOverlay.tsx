import { CloseIcon, ItemIcon } from '@/assets/icons'
import { MarkerAnchorPopover } from '@/shared/map/components/MarkerAnchorPopover'
import { useOrderStore } from '@/features/order/store/order.store'
import { useOrderActions } from '@/features/order/actions/order.actions'
import { useOrderStateByServerId } from '@/features/order/store/orderStateHooks.store'
import { StateCard } from '@/shared/layout/StateCard'
import {
  useOrderGroupMarkerOverlay,
  useOrderMapInteractionActions,
} from '@/features/order/store/orderMapInteractionHooks.store'
import type { Order } from '../../types/order'

type OrderGroupOverlayRowProps = {
  order: Order
  onSelectOrder: (order: Order) => void
}

const OrderGroupOverlayRow = ({ order, onSelectOrder }: OrderGroupOverlayRowProps) => {
  const orderState = useOrderStateByServerId(order.order_state_id ?? 1)
  const orderLabel = order.order_scalar_id != null ? `#${order.order_scalar_id}` : '#—'
  const address = order.client_address?.street_address ?? 'No address'
  const totalItems = order.total_items ?? 0

  return (
    <button
      key={order.client_id}
      type="button"
      onClick={() => onSelectOrder(order)}
      className="admin-glass-panel w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-left transition-colors hover:border-white/20 hover:bg-white/[0.1]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[var(--color-text)]">
            {orderLabel}
          </p>
          <p className="mt-1 truncate text-xs text-[var(--color-muted)]">
            {address}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {orderState && (
            <StateCard label={orderState.name} color={orderState.color ? orderState.color : '#363636ff'} />
          )}
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-[var(--color-muted)]">
            <ItemIcon className="h-3 w-3 app-icon" />
            <span>{totalItems}</span>
          </div>
        </div>
      </div>
    </button>
  )
}

export const OrderMarkerGroupOverlay = () => {
  const groupOverlay = useOrderGroupMarkerOverlay()
  const byClientId = useOrderStore((state) => state.byClientId)
  const { closeGroupOverlay } = useOrderMapInteractionActions()
  const { openOrderDetail } = useOrderActions()

  const markerId = groupOverlay.markerId
  const anchorEl = groupOverlay.markerAnchorEl
  const isOpen = Boolean(markerId && anchorEl)

  const orders = groupOverlay.orderClientIds
    .map((clientId) => byClientId[clientId])
    .filter((order) => Boolean(order))

  const handleSelectOrder = (order: Order) => {
    openOrderDetail(
      { clientId: order.client_id, mode: 'view', openSource: 'marker' },
      { pageClass: 'bg-[var(--color-muted)]/10 ', borderLeft: 'rgb(var(--color-light-blue-r),0.7)' },
    )
    closeGroupOverlay()
  }

  return (
    <MarkerAnchorPopover
      open={isOpen}
      anchorEl={anchorEl}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) closeGroupOverlay()
      }}
      className="z-50"
    >
      <div className="admin-glass-panel-strong w-[320px] overflow-hidden rounded-xl border border-white/12 shadow-[0_20px_44px_rgba(4,12,22,0.55)]">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-3 py-2">
          <p className="text-xs font-semibold text-[var(--color-text)]">
            {orders.length} grouped orders
          </p>
          <button
            type="button"
            onClick={closeGroupOverlay}
            aria-label="Close grouped marker list"
            className="rounded-md p-1 text-[var(--color-muted)] transition-colors hover:bg-white/[0.1]"
          >
            <CloseIcon className="h-3 w-3" />
          </button>
        </div>

        <div className="max-h-[300px] overflow-y-auto scroll-thin px-2 py-2">
          <div className="flex flex-col gap-2">
            {orders.map((order) => (
              <OrderGroupOverlayRow key={order.client_id} order={order} onSelectOrder={handleSelectOrder} />
            ))}
          </div>
        </div>
      </div>
    </MarkerAnchorPopover>
  )
}

