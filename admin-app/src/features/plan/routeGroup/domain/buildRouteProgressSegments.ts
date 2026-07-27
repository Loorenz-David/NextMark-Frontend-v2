import { buildRouteProgressSegments, type RouteProgressSegment } from '@shared-domain'

import type { Order } from '@/features/order/types/order'
import type { RouteSolution } from '@/features/plan/routeGroup/types/routeSolution'
import type { RouteSolutionStop } from '@/features/plan/routeGroup/types/routeSolutionStop'

type BuildAdminRouteProgressSegmentsParams = {
  orders: Order[]
  stopByOrderId: Map<number, RouteSolutionStop>
  selectedRouteSolution: RouteSolution | null
  completedOrderStateId: number | null
  failedOrderStateId: number | null
}

const isProgressTerminalOrder = (
  order: Order,
  completedOrderStateId: number | null,
  failedOrderStateId: number | null,
) => (
  order.order_state_id != null
  && (
    order.order_state_id === completedOrderStateId
    || order.order_state_id === failedOrderStateId
  )
)

export const buildAdminRouteProgressSegments = ({
  orders,
  stopByOrderId,
  selectedRouteSolution,
  completedOrderStateId,
  failedOrderStateId,
}: BuildAdminRouteProgressSegmentsParams): RouteProgressSegment[] => {
  if (!selectedRouteSolution) {
    return []
  }

  const orderById = new Map(
    orders.flatMap((order) => (
      order.id == null ? [] : [[order.id, order] as const]
    )),
  )

  const orderedStops = Array.from(stopByOrderId.entries())
    .flatMap(([orderId, stop]) => {
      if (stop.stop_order == null) {
        return []
      }
      const order = orderById.get(orderId)

      return [{
        stop,
        isTerminal: order
          ? isProgressTerminalOrder(
              order,
              completedOrderStateId,
              failedOrderStateId,
            )
          : false,
      }]
    })
    .sort(
      (left, right) =>
        (left.stop.stop_order ?? Number.POSITIVE_INFINITY)
        - (right.stop.stop_order ?? Number.POSITIVE_INFINITY),
    )

  return buildRouteProgressSegments({
    routeStarted: Boolean(selectedRouteSolution.actual_start_time),
    startLegPolyline: selectedRouteSolution.start_leg_polyline,
    stops: orderedStops.map(({ stop, isTerminal }) => ({
      toNextPolyline: stop.to_next_polyline,
      isTerminal,
    })),
    endLegPolyline: selectedRouteSolution.end_leg_polyline,
  })
}

export const serializeRouteProgressSegments = (
  segments: RouteProgressSegment[],
) => segments
  .map((segment) => `${segment.state}:${segment.path}`)
  .join('::')
