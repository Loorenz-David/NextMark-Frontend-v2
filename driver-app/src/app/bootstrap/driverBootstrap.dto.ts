import type { OrderStateMap } from '@shared-domain'

export type DriverBootstrapDto = {
  order_states: OrderStateMap
  route_timing?: {
    arrival_range_meters?: number | null
    visible_location_poll_interval_seconds?: number | null
  } | null
}
