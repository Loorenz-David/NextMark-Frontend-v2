export type DriverRouteTimingDeltaDto = {
  id: number
  client_id: string
  actual_start_time: string | null
  actual_end_time: string | null
}

export type DriverStopTimingDeltaDto = {
  id?: number | null
  client_id: string
  actual_arrival_time: string | null
  actual_departure_time: string | null
}

export type DriverRouteTimingCommandResponseDto = {
  recorded: boolean
  reason: 'outside_route_window' | 'already_recorded' | 'higher_priority_recorded' | null
  route?: DriverRouteTimingDeltaDto | null
}

export type DriverStopTimingCommandResponseDto = {
  recorded: boolean
  reason: 'outside_route_window' | 'already_recorded' | null
  stop?: DriverStopTimingDeltaDto | null
}

export type DriverObservedTimePayloadDto = {
  observed_time?: string | null
}
