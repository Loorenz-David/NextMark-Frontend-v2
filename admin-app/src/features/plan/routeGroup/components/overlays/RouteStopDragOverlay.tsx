import { useDndContext } from '@dnd-kit/core'

import type { Order } from '@/features/order/types/order'
import { RouteGroupOrderCard } from '@/features/plan/routeGroup/components'
import type { RouteSolutionStop } from '@/features/plan/routeGroup/types/routeSolutionStop'

type RouteStopDragOverlayProps = {
  routeStopClientId: string
  order: Order
  stop: RouteSolutionStop
  planStartDate?: string | null
}

export const RouteStopDragOverlay = ({ routeStopClientId, order, stop, planStartDate }: RouteStopDragOverlayProps) => {
  const { active, over } = useDndContext()

  let displayStopOrder: number | null = typeof stop?.stop_order === 'number' ? stop.stop_order : null

  if (
    active?.data.current?.type === 'route_stop' &&
    over?.data.current?.type === 'route_stop' &&
    active.id === routeStopClientId
  ) {
    const overStop = over.data.current?.stop as RouteSolutionStop | undefined
    if (typeof overStop?.stop_order === 'number') {
      displayStopOrder = overStop.stop_order
    }
  }

  return (
    <RouteGroupOrderCard
      order={order}
      stop={stop ?? null}
      displayStopOrder={displayStopOrder}
      planStartDate={planStartDate}
    />
  )
}
