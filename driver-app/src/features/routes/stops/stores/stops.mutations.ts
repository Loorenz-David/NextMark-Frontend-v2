import type { DriverRouteStopRecord } from '../domain'
import { useStopsStore } from './stops.store'

export const setStops = (stops: { byClientId: Record<string, DriverRouteStopRecord>; allIds: string[] }) =>
  useStopsStore.getState().insertMany(stops)

export const clearStops = () => useStopsStore.getState().clear()

export function patchStopTimingByClientId(
  clientId: string,
  partial: Pick<DriverRouteStopRecord, 'actual_arrival_time' | 'actual_departure_time'>,
) {
  useStopsStore.getState().patch(clientId, partial)
}
