import type { RouteSolutionStop } from '@/features/plan/routeGroup/types/routeSolutionStop'

const DEFAULT_ROUTE_SOLUTION_STOP: RouteSolutionStop = {
  id: 10101,
  client_id: 'fixture_route_stop_10101',
  order_id: 11001,
  route_solution_id: 9101,
  service_duration: '00:10:00',
  service_time: {
    time: 600,
    per_item: 120,
  },
  stop_order: 1,
  eta_status: 'on_time',
  in_range: true,
  expected_arrival_time: '2026-03-26T09:00:00.000Z',
  expected_departure_time: '2026-03-26T09:10:00.000Z',
  expected_service_duration_seconds: 600,
  has_constraint_violation: false,
  constraint_warnings: [],
  updated_at: '2026-03-26T08:30:00.000Z',
}

export const makeRouteSolutionStop = (
  overrides: Partial<RouteSolutionStop> = {},
): RouteSolutionStop => ({
  ...DEFAULT_ROUTE_SOLUTION_STOP,
  ...overrides,
  service_time: {
    ...DEFAULT_ROUTE_SOLUTION_STOP.service_time!,
    ...overrides.service_time,
  },
})
