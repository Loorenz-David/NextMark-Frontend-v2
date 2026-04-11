import { resetRouteOperationsOrderFixtures, seedRouteOperationsOrderFixtures } from '@/features/order/dev/fixtures'
import { resetRouteOperationsPlanFixtures } from '@/features/plan/dev/fixtures/resetRouteOperationsPlanFixtures'
import { seedRouteOperationsPlanFixtures } from '@/features/plan/dev/fixtures/seedRouteOperationsPlanFixtures'
import { buildRouteOperationsCanonicalScenario } from '@/features/plan/dev/fixtures/scenarios/routeOperationsCanonicalScenario'

export const resetCanonicalRouteOperationsScenario = () => {
  resetRouteOperationsPlanFixtures()
  resetRouteOperationsOrderFixtures()
}

export const seedCanonicalRouteOperationsScenario = () => {
  const scenario = buildRouteOperationsCanonicalScenario()

  resetCanonicalRouteOperationsScenario()

  seedRouteOperationsPlanFixtures({
    routePlans: scenario.routePlans,
    routePlanStates: scenario.routePlanStates,
    routeGroups: scenario.routeGroups,
    routeSolutions: scenario.routeSolutions,
    routeSolutionStops: scenario.routeSolutionStops,
    visibleRoutePlanClientIds: scenario.visibleRoutePlanClientIds,
    planStats: scenario.planStats,
  })

  seedRouteOperationsOrderFixtures({
    orders: scenario.orders,
    items: scenario.items,
    orderStates: scenario.orderStates,
    visibleOrderClientIds: scenario.visibleOrderClientIds,
    orderStats: scenario.orderStats,
  })

  return scenario
}
