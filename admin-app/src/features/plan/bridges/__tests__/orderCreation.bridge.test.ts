import { handlePlanOrderCreation } from '../orderCreation.bridge'

import { clearRoutePlans, insertRoutePlan } from '@/features/plan/store/routePlan.slice'
import {
  clearRouteSolutions,
  useRouteSolutionStore,
} from '@/features/plan/routeGroup/store/routeSolution.store'
import {
  clearRouteSolutionStops,
  useRouteSolutionStopStore,
} from '@/features/plan/routeGroup/store/routeSolutionStop.store'
import type { OrderCreateBundle } from '@/features/order/types/order'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const buildBundle = (deliveryPlanId?: number): OrderCreateBundle => ({
  order: {
    client_id: 'order_1',
    id: 1,
    delivery_plan_id: deliveryPlanId ?? null,
  },
  order_stops: [
    {
      client_id: 'stop_1',
      route_solution_id: 10,
      stop_order: 1,
      order_id: 1,
    },
  ],
  route_solution: [
    {
      client_id: 'route_10',
      id: 10,
      route_group_id: 20,
      route_end_strategy: 'round_trip',
    },
  ],
})

const resetStores = () => {
  clearRoutePlans()
  clearRouteSolutions()
  clearRouteSolutionStops()
}

export const runOrderCreationBridgeTests = () => {
  {
    resetStores()
    handlePlanOrderCreation(buildBundle(undefined))
    assert(
      useRouteSolutionStopStore.getState().allIds.length === 0,
      'missing route_plan_id should no-op',
    )
  }

  {
    resetStores()
    handlePlanOrderCreation(buildBundle(101))
    assert(
      useRouteSolutionStore.getState().allIds.includes('route_10'),
      'route plan should apply route solution updates',
    )
    assert(
      useRouteSolutionStopStore.getState().allIds.includes('stop_1'),
      'route plan should apply route stop updates',
    )
    insertRoutePlan({ client_id: 'plan_1', id: 101, label: 'Plan' })
  }

  resetStores()
}
