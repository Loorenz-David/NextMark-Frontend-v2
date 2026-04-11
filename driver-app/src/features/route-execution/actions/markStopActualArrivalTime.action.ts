import { patchStopTimingByClientId } from '@/features/routes/stops'
import { markStopActualArrivalTimeApi } from '../api'

export async function markStopActualArrivalTimeAction(stopClientId: string, observedTime?: string | null) {
  const response = await markStopActualArrivalTimeApi(stopClientId, { observed_time: observedTime ?? null })
  const payload = response.data

  if (payload?.stop) {
    patchStopTimingByClientId(payload.stop.client_id, {
      actual_arrival_time: payload.stop.actual_arrival_time,
      actual_departure_time: payload.stop.actual_departure_time,
    })
  }

  return payload
}
