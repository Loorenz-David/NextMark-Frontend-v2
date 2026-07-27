import type { Order } from '@/features/order/types/order'
import type { RouteSolution } from '@/features/plan/routeGroup/types/routeSolution'
import type { RouteSolutionStop } from '@/features/plan/routeGroup/types/routeSolutionStop'

import {
  buildAdminRouteProgressSegments,
  serializeRouteProgressSegments,
} from '../buildRouteProgressSegments'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const buildOrder = (
  id: number,
  orderStateId: number,
): Order => ({
  id,
  client_id: `order-${id}`,
  operation_type: 'dropoff',
  order_state_id: orderStateId,
})

const buildStop = (
  id: number,
  orderId: number,
  stopOrder: number,
): RouteSolutionStop => ({
  id,
  client_id: `stop-${id}`,
  order_id: orderId,
  route_solution_id: 100,
  stop_order: stopOrder,
  to_next_polyline: `leg-${stopOrder}`,
})

const routeSolution: RouteSolution = {
  id: 100,
  client_id: 'route-100',
  route_end_strategy: 'round_trip',
  actual_start_time: '2026-07-27T08:00:00.000Z',
  start_leg_polyline: 'start',
  end_leg_polyline: 'end',
}

export const runBuildRouteProgressSegmentsTests = () => {
  const stopOne = buildStop(11, 1, 1)
  const stopTwo = buildStop(12, 2, 2)
  const stopThree = buildStop(13, 3, 3)
  const stopByOrderId = new Map([
    [1, stopOne],
    [2, stopTwo],
    [3, stopThree],
  ])

  const segments = buildAdminRouteProgressSegments({
    orders: [
      buildOrder(3, 7),
      buildOrder(1, 6),
      buildOrder(2, 8),
    ],
    stopByOrderId,
    selectedRouteSolution: routeSolution,
    completedOrderStateId: 6,
    failedOrderStateId: 8,
  })

  assert(
    segments.map((segment) => segment.path).join(',') === 'start,leg-1,leg-2,leg-3,end',
    'route segments should follow stop order regardless of incoming order order',
  )
  assert(segments[1]?.state === 'completed', 'Completed should advance progress')
  assert(segments[2]?.state === 'completed', 'Fail should advance progress')
  assert(segments[3]?.state === 'pending', 'Cancelled should not advance progress')
  assert(segments.at(-1)?.state === 'pending', 'the end leg should wait for every stop')

  const originalSignature = serializeRouteProgressSegments(segments)
  const changedSignature = serializeRouteProgressSegments(
    segments.map((segment, index) => (
      index === 3 ? { ...segment, state: 'completed' } : segment
    )),
  )
  assert(
    originalSignature !== changedSignature,
    'route signatures should change when progress changes without path changes',
  )

  assert(
    buildAdminRouteProgressSegments({
      orders: [],
      stopByOrderId: new Map(),
      selectedRouteSolution: null,
      completedOrderStateId: 6,
      failedOrderStateId: 8,
    }).length === 0,
    'a missing selected solution should not produce map segments',
  )
}
