export type OrderStates =
  | 'Draft'
  | 'Confirmed'
  | 'Preparing'
  | 'Ready'
  | 'Processing'
  | 'Completed'
  | 'Cancelled'
  | 'Fail'

export type OrderState = {
  id: number
  client_id: string
  name: OrderStates
  color?: string | null
  index?: number | null
  is_system?: boolean
}

export type OrderStateMap = {
  byClientId: Record<string, OrderState>
  allIds: string[]
}
