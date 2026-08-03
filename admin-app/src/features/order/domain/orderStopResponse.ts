import type {
  RouteSolutionStop,
  RouteSolutionStopMap,
} from '@/features/plan/routeGroup/types/routeSolutionStop'

import type { OrderStopResponseMap } from '../types/order'

export const normalizeOrderStopResponse = (
  payload: OrderStopResponseMap | RouteSolutionStop[] | null | undefined,
): RouteSolutionStopMap | null => {
  if (!payload) {
    return null
  }

  const byClientId: RouteSolutionStopMap['byClientId'] = {}
  const allIds: string[] = []

  const values: unknown[] = Array.isArray(payload) ? payload : Object.values(payload)

  values.forEach((entry) => {
    if (!entry || typeof entry !== 'object' || !('client_id' in entry)) {
      return
    }

    const stop = entry as Partial<RouteSolutionStop>
    const clientId = stop.client_id
    if (typeof clientId !== 'string' || !clientId) {
      return
    }

    byClientId[clientId] = stop as RouteSolutionStop
    if (!allIds.includes(clientId)) {
      allIds.push(clientId)
    }
  })

  if (!allIds.length) {
    return null
  }

  return { byClientId, allIds }
}

/**
 * Narrows a stop map to the stops a caller still considers current.
 *
 * A move's response carries the resequenced stops of every route it touched, so
 * it can include stops belonging to orders the caller has no authority over
 * anymore. Returns null when nothing survives, matching the shape callers
 * already handle for an empty response.
 */
export const filterOrderStopsByOrder = (
  stops: RouteSolutionStopMap | null | undefined,
  shouldKeep: (orderId: number | null | undefined) => boolean,
): RouteSolutionStopMap | null => {
  if (!stops) {
    return null
  }

  const byClientId: RouteSolutionStopMap['byClientId'] = {}
  const allIds: string[] = []

  stops.allIds.forEach((clientId) => {
    const stop = stops.byClientId[clientId]
    if (!stop || !shouldKeep(stop.order_id)) {
      return
    }

    byClientId[clientId] = stop
    allIds.push(clientId)
  })

  return allIds.length ? { byClientId, allIds } : null
}
