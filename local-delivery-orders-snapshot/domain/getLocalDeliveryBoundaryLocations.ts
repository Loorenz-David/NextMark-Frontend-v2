import type { Order } from '@/features/order/types/order'
import type { RouteSolutionStop } from '@/features/local-delivery-orders/types/routeSolutionStop'
import type { RouteSolution } from '@/features/local-delivery-orders/types/routeSolution'
import type { RouteSolutionWarning } from '@/features/local-delivery-orders/types/routeSolution'
import type { address } from '@/types/address'

export type BoundaryLocationMeta = {
  label: 'Start location' | 'End location'
  location: address | null
  time: string | null
  hasWarnings: boolean
  warnings: RouteSolutionWarning[]
}

type BoundaryLocations = {
  start: BoundaryLocationMeta
  end: BoundaryLocationMeta
}

export const getLocalDeliveryBoundaryLocations = (
  stopByOrderId: Map<number, RouteSolutionStop>,
  ordersById: Map<number, Order>,
  selectedRouteSolution: RouteSolution | null,
): BoundaryLocations => {
  const { firstOrderAddress, lastOrderAddress } = resolveBoundaryOrderAddresses(
    stopByOrderId,
    ordersById,
  )

  const startLocation = selectedRouteSolution?.start_location ?? null
  const endLocation = selectedRouteSolution?.end_location ?? null
  const routeEndStrategy: RouteSolution['route_end_strategy'] =
    selectedRouteSolution?.route_end_strategy ?? 'round_trip'

  const startAddress = startLocation ?? firstOrderAddress
  const endAddress = resolveEndAddress({
    routeEndStrategy,
    startAddress,
    endLocation,
    lastOrderAddress,
  })

  const start = buildBoundaryLocation({
    label: 'Start location',
    location: startAddress,
    time: selectedRouteSolution?.expected_start_time ?? null,
    hasWarnings: false,
    warnings: [],
  })

  const endWarnings = normalizeRouteWarnings(selectedRouteSolution)
  const end = buildBoundaryLocation({
    label: 'End location',
    location: endAddress,
    time: selectedRouteSolution?.expected_end_time ?? null,
    hasWarnings: endWarnings.length > 0,
    warnings: endWarnings,
  })

  return { start, end }
}



const resolveBoundaryOrderAddresses = (
  stopByOrderId: Map<number, RouteSolutionStop>,
  ordersById: Map<number, Order>,
) => {
  let firstOrderAddress: address | null = null
  let lastOrderAddress: address | null = null
  let minStopOrder = Number.POSITIVE_INFINITY
  let maxStopOrder = Number.NEGATIVE_INFINITY

  stopByOrderId.forEach((stop, orderId) => {
    const stopOrder = stop.stop_order
    if (typeof stopOrder !== 'number') return
    const orderAddress = ordersById.get(orderId)?.client_address ?? null
    if (!orderAddress) return

    if (stopOrder < minStopOrder) {
      minStopOrder = stopOrder
      firstOrderAddress = orderAddress
    }
    if (stopOrder > maxStopOrder) {
      maxStopOrder = stopOrder
      lastOrderAddress = orderAddress
    }
  })

  return { firstOrderAddress, lastOrderAddress }
}

const buildBoundaryLocation = ({
  label,
  location,
  time,
  hasWarnings,
  warnings,
}: {
  label: BoundaryLocationMeta['label']
  location: address | null
  time: string | null
  hasWarnings: boolean
  warnings: RouteSolutionWarning[]
}): BoundaryLocationMeta => ({
  label,
  location,
  time,
  hasWarnings,
  warnings,
})

const resolveEndAddress = ({
  routeEndStrategy,
  startAddress,
  endLocation,
  lastOrderAddress,
}: {
  routeEndStrategy: RouteSolution['route_end_strategy']
  startAddress: address | null
  endLocation: address | null
  lastOrderAddress: address | null
}): address | null => {
  if (routeEndStrategy === 'round_trip') return startAddress
  if (routeEndStrategy === 'end_at_last_stop') return lastOrderAddress
  if (routeEndStrategy === 'custom_end_address') {
    return endLocation ?? lastOrderAddress
  }
  return lastOrderAddress
}

const normalizeRouteWarnings = (
  selectedRouteSolution: RouteSolution | null,
): RouteSolutionWarning[] => {
  return Array.isArray(selectedRouteSolution?.route_warnings)
    ? selectedRouteSolution.route_warnings
    : []
}
