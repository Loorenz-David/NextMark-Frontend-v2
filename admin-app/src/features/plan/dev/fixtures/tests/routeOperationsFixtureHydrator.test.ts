import { resetCanonicalRouteOperationsScenario, seedCanonicalRouteOperationsScenario } from '@/features/plan/dev/fixtures'
import { useItemStore } from '@/features/order/item/store/item.store'
import { useOrderStore } from '@/features/order/store/order.store'
import { useRouteSolutionStore } from '@/features/plan/routeGroup/store/routeSolution.store'
import { useRoutePlanStore } from '@/features/plan/store/routePlan.slice'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

export const runRouteOperationsFixtureHydratorTests = () => {
  const scenario = seedCanonicalRouteOperationsScenario()

  assert(
    useRoutePlanStore.getState().allIds.length === scenario.routePlans.length,
    'plan seeder should populate route plan store',
  )
  assert(
    useRouteSolutionStore.getState().allIds.length === scenario.routeSolutions.length,
    'plan seeder should populate route solution store',
  )
  assert(
    useOrderStore.getState().visibleIds?.length === scenario.visibleOrderClientIds?.length,
    'order seeder should populate visible orders',
  )
  assert(
    useItemStore.getState().allIds.length === scenario.items.length,
    'order seeder should populate item store',
  )

  resetCanonicalRouteOperationsScenario()

  assert(useRoutePlanStore.getState().allIds.length === 0, 'reset should clear route plan store')
  assert(useOrderStore.getState().allIds.length === 0, 'reset should clear order store')
}
