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
