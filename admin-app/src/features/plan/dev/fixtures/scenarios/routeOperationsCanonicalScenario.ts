import { makeItem, makeOrder, makeOrderState } from '@/features/order/dev/fixtures'
import { makeRouteGroup } from '@/features/plan/dev/fixtures/builders/makeRouteGroup'
import { makeRoutePlan } from '@/features/plan/dev/fixtures/builders/makeRoutePlan'
import { makeRoutePlanState } from '@/features/plan/dev/fixtures/builders/makeRoutePlanState'
import { makeRouteSolution } from '@/features/plan/dev/fixtures/builders/makeRouteSolution'
import { makeRouteSolutionStop } from '@/features/plan/dev/fixtures/builders/makeRouteSolutionStop'
import type { RouteOperationsFixtureScenario } from '@/features/plan/dev/fixtures/types'

const ORDER_SEED = [
  {
    id: 11001,
    scalar: 5001,
    firstName: 'Alex',
    lastName: 'Johnson',
    street: '8 Birger Jarlsgatan',
    lat: 59.3368,
    lng: 18.0731,
    orderStateId: 2,
    totalWeight: 18.5,
    totalVolume: 0.14,
    totalItems: 2,
  },
  {
    id: 11002,
    scalar: 5002,
    firstName: 'Mina',
    lastName: 'Larsson',
    street: '15 Sveavagen',
    lat: 59.3382,
    lng: 18.0584,
    orderStateId: 3,
    totalWeight: 14.2,
    totalVolume: 0.11,
    totalItems: 2,
  },
  {
    id: 11003,
    scalar: 5003,
    firstName: 'Jon',
    lastName: 'Hallberg',
    street: '22 Upplandsgatan',
    lat: 59.3412,
    lng: 18.0496,
    orderStateId: 2,
    totalWeight: 22.9,
    totalVolume: 0.16,
    totalItems: 3,
  },
  {
    id: 11004,
    scalar: 5004,
    firstName: 'Sara',
    lastName: 'Lind',
    street: '31 Odengatan',
    lat: 59.3439,
    lng: 18.0478,
    orderStateId: 4,
    totalWeight: 12.6,
    totalVolume: 0.09,
    totalItems: 1,
  },
  {
    id: 11005,
    scalar: 5005,
    firstName: 'Noah',
    lastName: 'Wester',
    street: '41 Torsgatan',
    lat: 59.3456,
    lng: 18.0381,
    orderStateId: 2,
    totalWeight: 19.7,
    totalVolume: 0.15,
    totalItems: 2,
  },
  {
    id: 11006,
    scalar: 5006,
    firstName: 'Ella',
    lastName: 'Nyberg',
    street: '18 Sankt Eriksgatan',
    lat: 59.3347,
    lng: 18.0325,
    orderStateId: 3,
    totalWeight: 27.1,
    totalVolume: 0.18,
    totalItems: 3,
  },
  {
    id: 11007,
    scalar: 5007,
    firstName: 'Viktor',
    lastName: 'Ek',
    street: '11 Hantverkargatan',
    lat: 59.3295,
    lng: 18.0387,
    orderStateId: 2,
    totalWeight: 16.4,
    totalVolume: 0.13,
    totalItems: 2,
  },
  {
    id: 11008,
    scalar: 5008,
    firstName: 'Nora',
    lastName: 'Berg',
    street: '3 Hornsgatan',
    lat: 59.3208,
    lng: 18.0698,
    orderStateId: 5,
    totalWeight: 21,
    totalVolume: 0.16,
    totalItems: 1,
  },
] as const

const buildItemsForOrder = (orderId: number, startId: number, totalItems: number) =>
  Array.from({ length: totalItems }, (_, index) =>
    makeItem({
      id: startId + index,
      client_id: `fixture_item_${startId + index}`,
      article_number: `ART-${orderId}-${index + 1}`,
      reference_number: `REF-${orderId}-${index + 1}`,
      order_id: orderId,
      quantity: 1,
      weight: Number((4 + index * 1.4).toFixed(1)),
      dimension_depth: 20 + index * 2,
      dimension_height: 16 + index,
      dimension_width: 28 + index * 2,
    }),
  )

export const buildRouteOperationsCanonicalScenario = (): RouteOperationsFixtureScenario => {
  const routePlanStates = [
    makeRoutePlanState({ id: 1, client_id: 'fixture_route_plan_state_1', name: 'Open', color: '#64748B', index: 1 }),
    makeRoutePlanState({ id: 2, client_id: 'fixture_route_plan_state_2', name: 'Ready', color: '#2563EB', index: 2 }),
    makeRoutePlanState({ id: 3, client_id: 'fixture_route_plan_state_3', name: 'Processing', color: '#D97706', index: 3 }),
    makeRoutePlanState({ id: 4, client_id: 'fixture_route_plan_state_4', name: 'Completed', color: '#059669', index: 4 }),
  ]

  const orderStates = [
    makeOrderState({ id: 2, client_id: 'fixture_order_state_2', name: 'Confirmed', color: '#2563EB', index: 2 }),
    makeOrderState({ id: 3, client_id: 'fixture_order_state_3', name: 'Preparing', color: '#D97706', index: 3 }),
    makeOrderState({ id: 4, client_id: 'fixture_order_state_4', name: 'Ready', color: '#7C3AED', index: 4 }),
    makeOrderState({ id: 5, client_id: 'fixture_order_state_5', name: 'Processing', color: '#DC2626', index: 5 }),
  ]

  const orders = ORDER_SEED.map((entry, index) =>
    makeOrder({
      id: entry.id,
      client_id: `fixture_order_${entry.id}`,
      order_scalar_id: entry.scalar,
      reference_number: `RG-${entry.scalar}`,
      client_first_name: entry.firstName,
      client_last_name: entry.lastName,
      client_email: `${entry.firstName.toLowerCase()}.${entry.lastName.toLowerCase()}@example.com`,
      client_address: {
        street_address: entry.street,
        city: 'Stockholm',
        country: 'Sweden',
        postal_code: `11${120 + index}`,
        coordinates: {
          lat: entry.lat,
          lng: entry.lng,
        },
      },
      costumer_id: 3001 + index,
      costumer: {
        costumer_id: 3001 + index,
        client_id: `fixture_customer_${3001 + index}`,
      },
      order_state_id: entry.orderStateId,
      total_weight: entry.totalWeight,
      total_volume: entry.totalVolume,
      total_items: entry.totalItems,
    }),
  )

  const items = ORDER_SEED.flatMap((entry, index) =>
    buildItemsForOrder(entry.id, 21001 + index * 10, entry.totalItems),
  )

  const routePlan = makeRoutePlan({
    total_orders: orders.length,
    total_items: items.length,
    total_volume: Number(
      orders.reduce((sum, order) => sum + (order.total_volume ?? 0), 0).toFixed(2),
    ),
    total_weight: Number(
      orders.reduce((sum, order) => sum + (order.total_weight ?? 0), 0).toFixed(1),
    ),
    orders_ids: orders.map((order) => order.id!).filter((id): id is number => typeof id === 'number'),
  })

  const routeGroups = [
    makeRouteGroup({
      id: 8101,
      client_id: 'fixture_route_group_8101',
      state_id: 4,
      route_plan_id: routePlan.id,
      route_solutions_ids: [9101, 9102],
    }),
    makeRouteGroup({
      id: 8102,
      client_id: 'fixture_route_group_8102',
      state_id: 1,
      route_plan_id: routePlan.id,
      route_solutions_ids: [],
      is_optimized: false,
    }),
    makeRouteGroup({
      id: 8103,
      client_id: 'fixture_route_group_8103',
      state_id: 2,
      route_plan_id: routePlan.id,
      route_solutions_ids: [],
      is_optimized: false,
    }),
    makeRouteGroup({
      id: 8104,
      client_id: 'fixture_route_group_8104',
      state_id: 1,
      route_plan_id: routePlan.id,
      route_solutions_ids: [],
      is_optimized: false,
    }),
  ]

  const routeSolutions = [
    makeRouteSolution({
      id: 9101,
      client_id: 'fixture_route_solution_9101',
      label: 'North loop',
      route_group_id: 8101,
      is_selected: true,
      is_optimized: 'partial optimize',
      stop_count: 8,
      score: 82,
      has_route_warnings: false,
      route_warnings: [],
    }),
    makeRouteSolution({
      id: 9102,
      client_id: 'fixture_route_solution_9102',
      label: 'Balanced fallback',
      route_group_id: 8101,
      is_selected: false,
      is_optimized: 'not optimize',
      stop_count: 2,
      score: 96,
      total_distance_meters: 31400,
      total_travel_time_seconds: 13800,
      has_route_warnings: true,
      route_warnings: [
        {
          type: 'vehicle_max_duration_exceeded',
          severity: 'warning',
          message: 'Driver duration exceeds preferred threshold.',
          total_duration_minutes: 230,
          max_duration_minutes: 210,
        },
      ],
    }),
  ]

  const routeSolutionStops = [
    makeRouteSolutionStop({ id: 10101, client_id: 'fixture_route_stop_10101', order_id: 11001, route_solution_id: 9101, stop_order: 1, expected_arrival_time: '2026-03-26T09:00:00.000Z', expected_departure_time: '2026-03-26T09:10:00.000Z' }),
    makeRouteSolutionStop({ id: 10102, client_id: 'fixture_route_stop_10102', order_id: 11002, route_solution_id: 9101, stop_order: 2, expected_arrival_time: '2026-03-26T09:32:00.000Z', expected_departure_time: '2026-03-26T09:42:00.000Z' }),
    makeRouteSolutionStop({ id: 10103, client_id: 'fixture_route_stop_10103', order_id: 11003, route_solution_id: 9101, stop_order: 3, expected_arrival_time: '2026-03-26T10:12:00.000Z', expected_departure_time: '2026-03-26T10:24:00.000Z' }),
    makeRouteSolutionStop({ id: 10104, client_id: 'fixture_route_stop_10104', order_id: 11004, route_solution_id: 9101, stop_order: 4, expected_arrival_time: '2026-03-26T10:48:00.000Z', expected_departure_time: '2026-03-26T10:58:00.000Z' }),
    makeRouteSolutionStop({ id: 10105, client_id: 'fixture_route_stop_10105', order_id: 11005, route_solution_id: 9101, stop_order: 5, expected_arrival_time: '2026-03-26T11:26:00.000Z', expected_departure_time: '2026-03-26T11:38:00.000Z' }),
    makeRouteSolutionStop({ id: 10106, client_id: 'fixture_route_stop_10106', order_id: 11006, route_solution_id: 9101, stop_order: 6, expected_arrival_time: '2026-03-26T12:14:00.000Z', expected_departure_time: '2026-03-26T12:26:00.000Z' }),
    makeRouteSolutionStop({ id: 10107, client_id: 'fixture_route_stop_10107', order_id: 11007, route_solution_id: 9101, stop_order: 7, expected_arrival_time: '2026-03-26T13:02:00.000Z', expected_departure_time: '2026-03-26T13:14:00.000Z' }),
    makeRouteSolutionStop({ id: 10108, client_id: 'fixture_route_stop_10108', order_id: 11008, route_solution_id: 9101, stop_order: 8, expected_arrival_time: '2026-03-26T13:48:00.000Z', expected_departure_time: '2026-03-26T14:00:00.000Z' }),
    makeRouteSolutionStop({ id: 10109, client_id: 'fixture_route_stop_10109', order_id: 11001, route_solution_id: 9102, stop_order: 1, expected_arrival_time: '2026-03-26T09:10:00.000Z', expected_departure_time: '2026-03-26T09:20:00.000Z' }),
    makeRouteSolutionStop({ id: 10110, client_id: 'fixture_route_stop_10110', order_id: 11006, route_solution_id: 9102, stop_order: 2, expected_arrival_time: '2026-03-26T12:30:00.000Z', expected_departure_time: '2026-03-26T12:45:00.000Z', has_constraint_violation: true, constraint_warnings: [{ type: 'service_window_warning' }] }),
  ]

  const planStats = {
    plans: {
      total: 1,
      by_state: {
        [routePlan.state_id ?? 0]: 1,
      },
    },
    orders: {
      total: orders.length,
    },
    items: {
      total: items.length,
    },
  }

  const orderStats = {
    orders: {
      total: orders.length,
      by_state: orders.reduce<Record<number, number>>((acc, order) => {
        const key = order.order_state_id ?? 0
        acc[key] = (acc[key] ?? 0) + 1
        return acc
      }, {}),
    },
    items: {
      total: items.length,
    },
  }

  return {
    routePlans: [routePlan],
    routePlanStates,
    routeGroups,
    routeSolutions,
    routeSolutionStops,
    orders,
    items,
    orderStates,
    visibleRoutePlanClientIds: [routePlan.client_id],
    visibleOrderClientIds: orders.map((order) => order.client_id),
    planStats,
    orderStats,
  }
}
