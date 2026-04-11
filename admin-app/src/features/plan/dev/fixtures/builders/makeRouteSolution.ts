import type { RouteSolution } from '@/features/plan/routeGroup/types/routeSolution'

const DEFAULT_ROUTE_SOLUTION: RouteSolution = {
  id: 9101,
  client_id: 'fixture_route_solution_9101',
  _representation: 'full',
  score: 82,
  label: 'North loop',
  is_selected: true,
  is_optimized: 'optimize',
  stop_count: 8,
  total_distance_meters: 28400,
  total_travel_time_seconds: 12300,
  expected_start_time: '2026-03-26T08:30:00.000Z',
  expected_end_time: '2026-03-26T15:20:00.000Z',
  created_at: '2026-03-26T08:15:00.000Z',
  start_location: {
    street_address: '100 Dispatch Hub',
    city: 'Stockholm',
    country: 'Sweden',
    postal_code: '11120',
    coordinates: {
      lat: 59.3365,
      lng: 18.0632,
    },
  },
  end_location: {
    street_address: '100 Dispatch Hub',
    city: 'Stockholm',
    country: 'Sweden',
    postal_code: '11120',
    coordinates: {
      lat: 59.3365,
      lng: 18.0632,
    },
  },
  route_end_strategy: 'round_trip',
  set_start_time: '2026-03-26T08:30:00.000Z',
  set_end_time: '2026-03-26T18:00:00.000Z',
  eta_tolerance_seconds: 900,
  stops_service_time: {
    time: 600,
    per_item: 120,
  },
  driver_id: 31,
  vehicle_id: 41,
  route_group_id: 8101,
  has_route_warnings: false,
  route_warnings: [],
  updated_at: '2026-03-26T08:15:00.000Z',
}

export const makeRouteSolution = (overrides: Partial<RouteSolution> = {}): RouteSolution => ({
  ...DEFAULT_ROUTE_SOLUTION,
  ...overrides,
  start_location: {
    ...DEFAULT_ROUTE_SOLUTION.start_location!,
    ...overrides.start_location,
    coordinates: {
      ...DEFAULT_ROUTE_SOLUTION.start_location!.coordinates,
      ...overrides.start_location?.coordinates,
    },
  },
  end_location: {
    ...DEFAULT_ROUTE_SOLUTION.end_location!,
    ...overrides.end_location,
    coordinates: {
      ...DEFAULT_ROUTE_SOLUTION.end_location!.coordinates,
      ...overrides.end_location?.coordinates,
    },
  },
  stops_service_time: {
    ...DEFAULT_ROUTE_SOLUTION.stops_service_time!,
    ...overrides.stops_service_time,
  },
})
