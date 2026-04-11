import { patchRouteTimingByClientId } from '@/features/routes'
import { markRouteActualStartTimeApi } from '../api'

export async function markRouteActualStartTimeAction(routeSolutionId: number, observedTime?: string | null) {
  const response = await markRouteActualStartTimeApi(routeSolutionId, { observed_time: observedTime ?? null })
  const payload = response.data

  if (payload?.route) {
    patchRouteTimingByClientId(payload.route.client_id, {
      actual_start_time: payload.route.actual_start_time,
      actual_end_time: payload.route.actual_end_time,
    })
  }

  return payload
}
