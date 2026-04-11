import type { DeliveryPlan } from '@/features/plan/types/plan'

const DEFAULT_ROUTE_PLAN: DeliveryPlan = {
  id: 7101,
  client_id: 'fixture_route_plan_7101',
  label: 'North City Wave',
  start_date: '2026-03-26T08:00:00.000Z',
  end_date: '2026-03-26T19:00:00.000Z',
  created_at: '2026-03-25T20:00:00.000Z',
  updated_at: '2026-03-26T08:10:00.000Z',
  state_id: 2,
  total_orders: 8,
  total_items: 16,
  total_volume: 1.12,
  total_weight: 152.4,
}

export const makeRoutePlan = (overrides: Partial<DeliveryPlan> = {}): DeliveryPlan => ({
  ...DEFAULT_ROUTE_PLAN,
  ...overrides,
})
