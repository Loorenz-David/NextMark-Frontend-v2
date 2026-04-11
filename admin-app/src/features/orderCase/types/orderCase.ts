export type OrderCaseState = 'Open' | 'Resolving' | 'Resolved'

export interface CaseChat {
  id?: number
  client_id: string
  message: string
  creation_date: string
  user_id?: number | null
  user_name?: string | null
  order_case_id: number
}

export interface OrderCase {
  id?: number
  client_id: string
  order_id: number
  label?: string | null
  state: OrderCaseState
  creation_date: string
  updated_at?: string | null
  created_by?: number | null
  unseen_chats: number
  chats: CaseChat[]
  order_reference?: string | number
}

export type OrderCaseMap = {
  byClientId: Record<string, OrderCase>
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
  order_case_id: number
  message: string
}
