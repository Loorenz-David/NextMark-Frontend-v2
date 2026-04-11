export type OrderCaseState = 'Open' | 'Resolving' | 'Resolved'

export type CaseChat = {
  id?: number
  client_id: string
  message: string
  creation_date: string
  user_id?: number | null
  user_name?: string | null
  order_case_id: number
}

export type OrderCase = {
  id?: number
  client_id: string
  order_id: number
  label?: string | null
  state: OrderCaseState
  creation_date: string
  updated_at?: string | null
  created_by?: number | null
  unseen_chats: number
  order_reference?: string | number
}

export type OrderCaseMap = {
  byClientId: Record<string, OrderCase>
  allIds: string[]
}

export type CaseChatMap = {
  byClientId: Record<string, CaseChat>
  allIds: string[]
}

export type OrderCaseCreateFields = {
  client_id: string
  order_id: number
  state?: OrderCaseState
  label?: string | null
}

export type OrderCaseStateUpdateFields = {
  state: OrderCaseState
}

export type OrderCaseDeletePayload = {
  target_id?: number | string
  target_ids?: Array<number | string>
}

export type CaseChatCreateFields = {
  client_id?: string
  order_case_id: number
  message: string
}

export type DriverOrderCaseCommandDelta = {
  id: number
}

export type DriverCaseChatCommandDelta = {
  id: number
}
