import { buildRouteOperationsCanonicalScenario } from '@/features/plan/dev/fixtures'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

export const runRouteOperationsCanonicalScenarioTests = () => {
  const scenario = buildRouteOperationsCanonicalScenario()
  const routePlanIds = new Set(
    scenario.routePlans
      .map((routePlan) => routePlan.id)
      .filter((id): id is number => typeof id === 'number'),
  )
  const routeGroupIds = new Set(
    scenario.routeGroups
      .map((routeGroup) => routeGroup.id)
      .filter((id): id is number => typeof id === 'number'),
  )
  const routeSolutionIds = new Set(
    scenario.routeSolutions
      .map((routeSolution) => routeSolution.id)
      .filter((id): id is number => typeof id === 'number'),
  )
  const orderIds = new Set(
    scenario.orders
      .map((order) => order.id)
      .filter((id): id is number => typeof id === 'number'),
  )

  scenario.routeGroups.forEach((routeGroup) => {
    assert(
      typeof routeGroup.route_plan_id === 'number' && routePlanIds.has(routeGroup.route_plan_id),
      'route group should reference a seeded route plan',
    )
  })

  scenario.routeSolutions.forEach((routeSolution) => {
    assert(
      typeof routeSolution.route_group_id === 'number'
        && routeGroupIds.has(routeSolution.route_group_id),
      'route solution should reference a seeded route group',
    )
  })

  scenario.routeSolutionStops.forEach((routeStop) => {
    assert(
      typeof routeStop.route_solution_id === 'number'
        && routeSolutionIds.has(routeStop.route_solution_id),
      'route stop should reference a seeded route solution',
    )
    assert(
      typeof routeStop.order_id === 'number' && orderIds.has(routeStop.order_id),
      'route stop should reference a seeded order',
    )
  })

  scenario.orders.forEach((order) => {
    assert(
      typeof order.delivery_plan_id === 'number' && routePlanIds.has(order.delivery_plan_id),
      'order should reference the canonical route plan',
    )
  })

  scenario.items.forEach((item) => {
    assert(orderIds.has(item.order_id), 'item should reference a seeded order')
  })
}
