export type DriverOrderCommandDeltaDto = {
  id: number
  client_id: string
  order_state_id: number | null
  open_order_cases: number
}

export type DriverOrderCommandDeltaCollectionDto = {
  byClientId: Record<string, DriverOrderCommandDeltaDto>
  allIds: string[]
}
