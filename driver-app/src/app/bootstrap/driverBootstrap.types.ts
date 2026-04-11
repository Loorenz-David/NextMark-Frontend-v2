import type { OrderStateMap } from '@shared-domain'

export type DriverRouteTimingConfig = {
  arrivalRangeMeters: number
  visibleLocationPollIntervalSeconds: number
}

export type DriverBootstrapPayload = {
  orderStates: OrderStateMap
  routeTiming: DriverRouteTimingConfig
}

export type DriverBootstrapStatus = 'idle' | 'loading' | 'ready' | 'error'

export type DriverBootstrapState = {
  status: DriverBootstrapStatus
  error: string | null
  routeTiming: DriverRouteTimingConfig | null
}
