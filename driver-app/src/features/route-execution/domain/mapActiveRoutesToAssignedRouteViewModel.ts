import type {
  AssignedRouteViewModel,
  AssignedStopViewModel,
  AssignedStopOrderItemPropertyViewModel,
  AssignedStopOrderItemViewModel,
} from '@/app/contracts/routeExecution.types'
import type { DriverOrderStateIds } from '@/features/order-states'
import type { RouteSolution, RouteSolutionStop, Order, Phone, address } from '@shared-domain'
import type { ActiveRoutesPayload, DriverOrderRecord, DriverRouteRecord } from '@/features/routes'
import type { RouteOrdersPayload } from '@/features/routes/orders/domain/orders.types'
import type { DriverRouteStopRecord } from '@/features/routes/stops'
import type { RouteStopsPayload } from '@/features/routes/stops/domain/stops.types'

function mapPhone(value: unknown): Phone | null {
  if (
    typeof value === 'object' &&
    value !== null &&
    'prefix' in value &&
    'number' in value &&
    typeof value.prefix === 'string' &&
    typeof value.number === 'string'
  ) {
    return { prefix: value.prefix, number: value.number }
  }

  return null
}

function mapAddress(value: Record<string, unknown> | null): address | null {
  if (!value) {
    return null
  }

  const coordinates = value.coordinates
  if (
    typeof coordinates !== 'object' ||
    coordinates === null ||
    !('lat' in coordinates) ||
    !('lng' in coordinates) ||
    typeof coordinates.lat !== 'number' ||
    typeof coordinates.lng !== 'number'
  ) {
    return null
  }

  return {
    street_address: typeof value.street_address === 'string' ? value.street_address : '',
    city: typeof value.city === 'string' ? value.city : undefined,
    country: typeof value.country === 'string' ? value.country : undefined,
    postal_code: typeof value.postal_code === 'string' ? value.postal_code : undefined,
    coordinates: {
      lat: coordinates.lat,
      lng: coordinates.lng,
    },
  }
}

function mapOrder(order: DriverOrderRecord | null): Order | null {
  if (!order) {
    return null
  }

  const orderNotes = Array.isArray(order.order_notes)
    ? order.order_notes
    : order.order_notes != null
      ? [order.order_notes]
      : null

  return {
    id: order.id,
    client_id: order.client_id,
    order_plan_objective: order.order_plan_objective,
    operation_type: order.operation_type as Order['operation_type'],
    order_scalar_id: order.order_scalar_id,
    reference_number: order.reference_number,
    external_order_id: order.external_order_id,
    external_source: order.external_source,
    tracking_number: order.tracking_number,
    client_first_name: order.client_first_name,
    client_last_name: order.client_last_name,
    client_email: order.client_email,
    client_primary_phone: mapPhone(order.client_primary_phone),
    client_secondary_phone: mapPhone(order.client_secondary_phone),
    client_address: mapAddress(order.client_address),
    delivery_windows: order.delivery_windows.map((window) => ({
      id: window.id,
      client_id: window.client_id,
      start_at: window.start_at ?? '',
      end_at: window.end_at ?? '',
      window_type: (window.window_type ?? 'TIME_RANGE') as NonNullable<Order['delivery_windows']>[number]['window_type'],
    })),
    creation_date: order.creation_date,
    items_updated_at: order.items_updated_at,
    order_state_id: order.order_state_id,
    delivery_plan_id: order.delivery_plan_id,
    costumer_id: order.costumer_id,
    open_order_cases: order.open_order_cases,
    order_notes: orderNotes,
  }
}

function buildPhoneLine(order: DriverOrderRecord | null) {
  const primary = mapPhone(order?.client_primary_phone)
  const secondary = mapPhone(order?.client_secondary_phone)
  const phone = primary ?? secondary
  if (!phone) {
    return null
  }

  return `${phone.prefix}${phone.number}`
}

function buildItemSummary(order: DriverOrderRecord | null) {
  if (!order || order.items.allIds.length === 0) {
    return null
  }

  const labels = order.items.allIds
    .map((clientId) => order.items.byClientId[clientId])
    .filter((item): item is DriverOrderRecord['items']['byClientId'][string] => Boolean(item))
    .map((item) => {
      if (typeof item.quantity === 'number' && !Number.isNaN(item.quantity)) {
        return `Qty ${item.quantity}`
      }

      return null
    })
    .filter(Boolean)

  if (labels.length === 0) {
    return null
  }

  return labels.join(' + ')
}

function formatPropertyLabel(key: string) {
  const normalized = key
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!normalized) {
    return 'Property'
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

function formatPropertyValue(value: unknown): string {
  if (value == null) {
    return '—'
  }

  if (typeof value === 'string') {
    const normalized = value.trim()
    return normalized.length > 0 ? normalized : '—'
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  if (Array.isArray(value)) {
    const normalized = value
      .map((entry) => formatPropertyValue(entry))
      .filter((entry) => entry !== '—')

    return normalized.length > 0 ? normalized.join(', ') : '—'
  }

  try {
    return JSON.stringify(value)
  } catch {
    return '—'
  }
}

function buildOrderItemProperties(value: unknown): AssignedStopOrderItemPropertyViewModel[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .flatMap((entry) => {
      if (typeof entry !== 'object' || entry == null || Array.isArray(entry)) {
        return []
      }

      return Object.entries(entry).map(([key, entryValue]) => ({
        label: formatPropertyLabel(key),
        value: formatPropertyValue(entryValue),
      }))
    })
    .filter((entry) => entry.value !== '—')
}

function buildDimensionsLabel(item: DriverOrderRecord['items']['byClientId'][string]) {
  const dimensions = [
    item.dimension_width,
    item.dimension_height,
    item.dimension_depth,
  ]

  if (dimensions.every((value) => value == null)) {
    return null
  }

  return `W ${item.dimension_width ?? 0} x H ${item.dimension_height ?? 0} x D ${item.dimension_depth ?? 0}`
}

function buildItemImages(item: DriverOrderRecord['items']['byClientId'][string]) {
  return Array.isArray(item.item_images)
    ? item.item_images
      .map((imageUrl) => imageUrl.trim())
      .filter(Boolean)
    : []
}

function mapOrderItem(item: DriverOrderRecord['items']['byClientId'][string]): AssignedStopOrderItemViewModel {
  return {
    clientId: item.client_id,
    itemType: item.item_type?.trim() || null,
    articleNumber: item.article_number.trim() || null,
    referenceNumber: item.reference_number?.trim() || null,
    quantity: item.quantity,
    weight: item.weight,
    pageLink: item.page_link?.trim() || null,
    itemImages: buildItemImages(item),
    dimensionsLabel: buildDimensionsLabel(item),
    properties: buildOrderItemProperties(item.properties),
  }
}

function buildOrderItems(order: DriverOrderRecord | null): AssignedStopOrderItemViewModel[] {
  if (!order || order.items.allIds.length === 0) {
    return []
  }

  return order.items.allIds
    .map((clientId) => order.items.byClientId[clientId])
    .filter((item): item is DriverOrderRecord['items']['byClientId'][string] => Boolean(item))
    .map(mapOrderItem)
}

function buildAddressTitle(order: Order | null, stop: RouteSolutionStop) {
  if (order?.client_address?.street_address) {
    const [streetOnly] = order.client_address.street_address
      .split(',')
      .map((segment) => segment.trim())
      .filter(Boolean)

    if (streetOnly) {
      return streetOnly
    }
  }

  if (stop.stop_order != null) {
    return `Stop ${stop.stop_order}`
  }

  return 'Delivery stop'
}

function buildSecondaryAddressLine(order: Order | null) {
  const address = order?.client_address
  if (!address) {
    return null
  }

  const parts = [address.city, address.country, address.postal_code]
    .filter((value): value is string => Boolean(value))

  return parts.length > 0 ? parts.join(', ') : null
}

function buildBadgeLabel(order: DriverOrderRecord | null, stop: RouteSolutionStop) {
  if (order?.order_scalar_id != null) {
    return `# ${order.order_scalar_id}`
  }

  if (order?.reference_number) {
    return `# ${order.reference_number}`
  }

  if (stop.stop_order != null) {
    return `# ${String(stop.stop_order).padStart(2, '0')}`
  }

  return null
}

function buildSearchText(orderRecord: DriverOrderRecord | null, order: Order | null, stop: RouteSolutionStop) {
  const itemTokens = orderRecord
    ? orderRecord.items.allIds
      .map((clientId) => orderRecord.items.byClientId[clientId])
      .filter((item): item is DriverOrderRecord['items']['byClientId'][string] => Boolean(item))
      .flatMap((item) => [
        item.article_number,
        item.reference_number,
        item.item_type,
        item.page_link,
      ])
    : []

  return [
    order?.reference_number,
    order?.external_order_id,
    order?.external_source,
    order?.tracking_number,
    order?.client_first_name,
    order?.client_last_name,
    order?.client_email,
    order?.client_primary_phone?.prefix,
    order?.client_primary_phone?.number,
    order?.client_secondary_phone?.prefix,
    order?.client_secondary_phone?.number,
    order?.client_address?.street_address,
    order?.client_address?.city,
    order?.client_address?.country,
    order?.client_address?.postal_code,
    order?.order_scalar_id,
    stop.service_duration,
    buildAddressTitle(order, stop),
    buildSecondaryAddressLine(order),
    buildItemSummary(orderRecord),
    buildPhoneLine(orderRecord),
    buildBadgeLabel(orderRecord, stop),
    ...itemTokens,
  ]
    .filter((value): value is string | number => value != null && value !== '')
    .join(' ')
    .toLowerCase()
}

function mapRouteStop(stop: DriverRouteStopRecord): RouteSolutionStop {
  return {
    client_id: stop.client_id,
    route_solution_id: stop.route_solution_id,
    order_id: stop.order_id,
    service_duration: stop.service_duration,
    service_time: stop.service_time as RouteSolutionStop['service_time'],
    stop_order: stop.stop_order,
    eta_status: stop.eta_status,
    in_range: stop.in_range,
    reason_was_skipped: stop.reason_was_skipped,
    expected_arrival_time: stop.expected_arrival_time,
    expected_departure_time: stop.expected_departure_time,
    expected_service_duration_seconds: stop.expected_service_duration_seconds,
    actual_arrival_time: stop.actual_arrival_time,
    actual_departure_time: stop.actual_departure_time,
    to_next_polyline: typeof stop.to_next_polyline === 'string' ? stop.to_next_polyline : null,
    has_constraint_violation: stop.has_constraint_violation ?? undefined,
    constraint_warnings: Array.isArray(stop.constraint_warnings)
      ? stop.constraint_warnings as Array<Record<string, unknown>>
      : null,
  }
}

function mapRoute(route: DriverRouteRecord): RouteSolution {
  return {
    id: route.id,
    client_id: route.client_id,
    _representation: route._representation,
    score: route.score ?? null,
    label: route.label ?? null,
    is_selected: route.is_selected,
    is_optimized: route.is_optimized ?? null,
    start_leg_polyline: typeof route.start_leg_polyline === 'string' ? route.start_leg_polyline : null,
    end_leg_polyline: typeof route.end_leg_polyline === 'string' ? route.end_leg_polyline : null,
    total_distance_meters: route.total_distance_meters ?? null,
    total_travel_time_seconds: route.total_travel_time_seconds ?? null,
    expected_start_time: route.expected_start_time ?? null,
    expected_end_time: route.expected_end_time ?? null,
    actual_start_time: route.actual_start_time ?? null,
    actual_end_time: route.actual_end_time ?? null,
    created_at: route.created_at,
    start_location: mapAddress(route.start_location ?? null),
    end_location: mapAddress(route.end_location ?? null),
    route_end_strategy: (route.route_end_strategy ?? 'end_at_last_stop') as RouteSolution['route_end_strategy'],
    set_start_time: route.set_start_time ?? null,
    set_end_time: route.set_end_time ?? null,
    eta_tolerance_seconds: route.eta_tolerance_seconds ?? null,
    stops_service_time: (route.stops_service_time ?? null) as RouteSolution['stops_service_time'],
    driver_id: route.driver_id,
    route_group_id: route.route_group_id,
    has_route_warnings: route.has_route_warnings ?? undefined,
    route_warnings: Array.isArray(route.route_warnings)
      ? route.route_warnings as RouteSolution['route_warnings']
      : null,
  }
}

export function createDriverOrderLookup(orders: DriverOrderRecord[]) {
  return orders.reduce<Record<number, DriverOrderRecord>>((lookup, order) => {
    if (order.id != null) {
      lookup[order.id] = order
    }
    return lookup
  }, {})
}

function isTerminalOrderState(
  orderStateId: number | null | undefined,
  orderStateIds: DriverOrderStateIds,
) {
  return (
    orderStateId != null
    && (
      orderStateId === orderStateIds.completedId
      || orderStateId === orderStateIds.failId
    )
  )
}

function buildAssignedStops(
  routeStops: DriverRouteStopRecord[],
  orderLookup: Record<number, DriverOrderRecord>,
  orderStateIds: DriverOrderStateIds,
): {
  activeStopClientId: string | null
  completedStops: number
  rawStops: RouteSolutionStop[]
  stops: AssignedStopViewModel[]
} {
  const rawStops = routeStops
    .map(mapRouteStop)

  const activeStop = rawStops.find((stop) => {
    const orderRecord = stop.order_id != null ? orderLookup[stop.order_id] ?? null : null
    return !isTerminalOrderState(orderRecord?.order_state_id, orderStateIds)
  }) ?? null
  const activeStopClientId = activeStop?.client_id ?? null

  const stops = rawStops.map((stop) => {
    const orderRecord = stop.order_id != null ? orderLookup[stop.order_id] ?? null : null
    const order = mapOrder(orderRecord)
    const isCompleted = isTerminalOrderState(orderRecord?.order_state_id, orderStateIds)

    return {
      stopClientId: stop.client_id,
      stopOrder: stop.stop_order ?? null,
      etaStatus: stop.eta_status ?? null,
      expectedArrivalTime: stop.expected_arrival_time ?? null,
      expectedDepartureTime: stop.expected_departure_time ?? null,
      serviceLabel: stop.service_duration ?? 'Service stop',
      serviceDurationLabel: stop.service_duration ?? null,
      title: buildAddressTitle(order, stop),
      secondaryAddressLine: buildSecondaryAddressLine(order),
      itemSummary: buildItemSummary(orderRecord),
      orderItems: buildOrderItems(orderRecord),
      phoneLine: buildPhoneLine(orderRecord),
      badgeLabel: buildBadgeLabel(orderRecord, stop),
      searchText: buildSearchText(orderRecord, order, stop),
      order,
      address: order?.client_address ?? null,
      isActive: stop.client_id === activeStopClientId,
      isCompleted,
    }
  })

  const completedStops = stops.filter((stop) => stop.isCompleted).length

  return {
    activeStopClientId,
    completedStops,
    rawStops,
    stops,
  }
}

export function mapActiveRoutesToAssignedRouteViewModel(
  payload: ActiveRoutesPayload & RouteOrdersPayload & RouteStopsPayload,
  orderStateIds: DriverOrderStateIds,
): AssignedRouteViewModel | null {
  const route =
    payload.routes.allIds
      .map((clientId) => payload.routes.byClientId[clientId])
      .find((candidate) => candidate?.is_selected)
    ?? payload.routes.byClientId[payload.routes.allIds[0]]
    ?? null

  if (!route) {
    return null
  }

  const orderLookup = createDriverOrderLookup(
    payload.orders.allIds
      .map((clientId) => payload.orders.byClientId[clientId])
      .filter((order): order is DriverOrderRecord => Boolean(order)),
  )

  const routeStops = payload.stops.allIds
    .map((clientId) => payload.stops.byClientId[clientId])
    .filter((stop): stop is DriverRouteStopRecord => Boolean(stop) && stop.route_solution_id === route.id)

  return mapDriverRouteRecordToAssignedRouteViewModel(route, orderLookup, routeStops, orderStateIds)
}

export function mapDriverRouteRecordToAssignedRouteViewModel(
  route: DriverRouteRecord | null,
  orderLookup: Record<number, DriverOrderRecord>,
  routeStops: DriverRouteStopRecord[],
  orderStateIds: DriverOrderStateIds,
): AssignedRouteViewModel | null {
  if (!route) {
    return null
  }

  const assignedStops = buildAssignedStops(routeStops, orderLookup, orderStateIds)

  return {
    routeClientId: route.client_id,
    label: route.delivery_plan?.label ?? route.label ?? 'Assigned route',
    score: route.score ?? null,
    deliveryPlanStartDate: route.delivery_plan?.start_date ?? null,
    deliveryPlanEndDate: route.delivery_plan?.end_date ?? null,
    startLocation: mapAddress(route.start_location ?? null),
    endLocation: mapAddress(route.end_location ?? null),
    activeStopClientId: assignedStops.activeStopClientId,
    completedStops: assignedStops.completedStops,
    totalStops: assignedStops.stops.length,
    route: mapRoute(route),
    rawStops: assignedStops.rawStops,
    stops: assignedStops.stops,
  }
}
