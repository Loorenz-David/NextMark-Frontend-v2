import { useMemo } from 'react'

import { CloseIcon, ItemIcon, TimeIcon } from '@/assets/icons'
import { useOrderActions } from '@/features/order'
import { useOrderStore } from '@/features/order/store/order.store'
import { MarkerAnchorPopover } from '@/shared/map/components/MarkerAnchorPopover'
import { useRouteSolutionStopStore } from '@/features/plan/routeGroup/store/routeSolutionStop.store'
import { formatRouteTime } from '@/features/plan/routeGroup/utils/formatRouteTime'
import {
  useRouteGroupMarkerGroupOverlay,
  useRouteGroupMapInteractionActions,
} from '@/features/plan/routeGroup/store/routeGroupMapInteractionHooks.store'

export const RouteGroupMarkerGroupOverlay = () => {
  const groupOverlay = useRouteGroupMarkerGroupOverlay()
  const byClientId = useOrderStore((state) => state.byClientId)
  const routeStopAllIds = useRouteSolutionStopStore((state) => state.allIds)
  const routeStopByClientId = useRouteSolutionStopStore((state) => state.byClientId)
  const { closeGroupOverlay } = useRouteGroupMapInteractionActions()
  const { openOrderDetail } = useOrderActions()

  const routeStops = useMemo(
    () => routeStopAllIds.map((clientId) => routeStopByClientId[clientId]).filter(Boolean),
    [routeStopAllIds, routeStopByClientId],
  )

  const stopByOrderId = useMemo(() => {
    const mapped = new Map<number, (typeof routeStops)[number]>()
    routeStops.forEach((stop) => {
      if (!stop || typeof stop.order_id !== 'number') return
      const current = mapped.get(stop.order_id)
      const currentOrder = typeof current?.stop_order === 'number' ? current.stop_order : Number.POSITIVE_INFINITY
      const nextOrder = typeof stop.stop_order === 'number' ? stop.stop_order : Number.POSITIVE_INFINITY
      if (!current || nextOrder <= currentOrder) {
        mapped.set(stop.order_id, stop)
      }
    })
    return mapped
  }, [routeStops])

  const markerId = groupOverlay.markerId
  const anchorEl = groupOverlay.markerAnchorEl
  const isOpen = Boolean(markerId && anchorEl)

  const orders = groupOverlay.orderClientIds
    .map((clientId) => byClientId[clientId])
    .filter((order) => Boolean(order))

  return (
    <MarkerAnchorPopover
      open={isOpen}
      anchorEl={anchorEl}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) closeGroupOverlay()
      }}
      className="z-50"
    >
      <div className="w-[300px] rounded-xl border border-[var(--color-border)] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-3 py-2">
          <p className="text-xs font-semibold text-[var(--color-text)]">
            {orders.length} grouped stops
          </p>
          <button
            type="button"
            onClick={closeGroupOverlay}
            aria-label="Close grouped route group marker list"
            className="rounded-md p-1 text-[var(--color-muted)] transition-colors hover:bg-[var(--color-muted)]/10"
          >
            <CloseIcon className="h-3 w-3" />
          </button>
        </div>

        <div className="max-h-[300px] overflow-y-auto scroll-thin px-2 py-2">
          <div className="flex flex-col gap-2">
            {orders.map((order) => {
              const orderLabel = order.reference_number ?? order.external_order_id ?? order.client_id
              const address = order.client_address?.street_address ?? 'No address'
              const stop = typeof order.id === 'number' ? stopByOrderId.get(order.id) : undefined
              const stopOrder = typeof stop?.stop_order === 'number' ? String(stop.stop_order) : '--'
              const eta = formatRouteTime(stop?.expected_arrival_time)
              const itemCount = order.total_items ?? 0

              return (
                <button
                  key={order.client_id}
                  type="button"
                  onClick={() => {
                    openOrderDetail(
                      {
                        mode: 'edit',
                        clientId: order.client_id,
                        openSource: 'marker',
                        routeGroupId: order.route_group_id ?? null,
                        headerBehavior: 'order-main-context',
                      },
                      { borderLeft: 'rgb(var(--color-light-blue-r),0.7)' },
                    )
                    closeGroupOverlay()
                  }}
                  className="w-full rounded-lg border border-[var(--color-border)]/60 bg-white px-3 py-2 text-left transition-colors hover:bg-[var(--color-light-blue)]/10"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-[var(--color-text)]">{orderLabel}</p>
                    <span className="rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-[11px] font-semibold text-[var(--color-primary)]">
                      {stopOrder}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-3">
                    <p className="truncate text-xs text-[var(--color-muted)]">{address}</p>
                    <div className="flex items-center gap-3 text-[11px] text-[var(--color-muted)]">
                      <div className="flex items-center gap-1">
                        <ItemIcon className="h-3 w-3 app-icon" />
                        <span>{itemCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TimeIcon className="h-3 w-3 app-icon" />
                        <span>{eta}</span>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </MarkerAnchorPopover>
  )
}
