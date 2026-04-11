import { patchStopTimingByClientId } from '@/features/routes/stops'
import { markStopActualDepartureTimeApi } from '../api'

export async function markStopActualDepartureTimeAction(stopClientId: string, observedTime?: string | null) {
  const response = await markStopActualDepartureTimeApi(stopClientId, { observed_time: observedTime ?? null })
  const payload = response.data

  if (payload?.stop) {
    patchStopTimingByClientId(payload.stop.client_id, {
      actual_arrival_time: payload.stop.actual_arrival_time,
      actual_departure_time: payload.stop.actual_departure_time,
    })
  }

  return payload
}
