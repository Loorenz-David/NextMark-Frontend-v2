import { getDriverBootstrapApi } from './driverBootstrap.api'
import type { DriverBootstrapPayload } from './driverBootstrap.types'

export async function loadDriverBootstrapQuery(): Promise<DriverBootstrapPayload> {
  const response = await getDriverBootstrapApi()
  const dto = response.data ?? { order_states: { byClientId: {}, allIds: [] }, route_timing: null }

  return {
    orderStates: dto.order_states,
    routeTiming: {
      arrivalRangeMeters: dto.route_timing?.arrival_range_meters ?? 75,
      visibleLocationPollIntervalSeconds: dto.route_timing?.visible_location_poll_interval_seconds ?? 20,
    },
  }
}
