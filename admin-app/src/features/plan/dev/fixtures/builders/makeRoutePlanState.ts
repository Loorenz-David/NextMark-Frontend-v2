import type { DeliveryPlanState } from '@/features/plan/types/planState'

const DEFAULT_ROUTE_PLAN_STATE: DeliveryPlanState = {
  id: 1,
  client_id: 'fixture_route_plan_state_1',
  name: 'Open',
  index: 1,
  color: '#64748B',
  is_system: true,
  team_id: 1,
}

export const makeRoutePlanState = (
  overrides: Partial<DeliveryPlanState> = {},
): DeliveryPlanState => ({
  ...DEFAULT_ROUTE_PLAN_STATE,
  ...overrides,
})
