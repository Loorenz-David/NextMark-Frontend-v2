export type DateRangeAccessRule = {
  id?: number
  client_id: string
  from_date?: string | null
  to_date?: string | null
  target_model?: string | null
  user_role_id?: number | null
}

export type DateRangeAccessRuleMap = {
  byClientId: Record<string, DateRangeAccessRule>
  allIds: string[]
}

export type DateRangeAccessRuleCreateFields = {
  client_id?: string
  from_date?: string | null
  to_date?: string | null
  target_model?: string | null
  user_role_id: number
}

export type DateRangeAccessRuleUpdateFields = Partial<DateRangeAccessRuleCreateFields>

export type OrderStateTransitionRule = {
  id?: number
  client_id: string
  allowed_state_id?: number | null
  user_role_id?: number | null
}

export type OrderStateTransitionRuleMap = {
  byClientId: Record<string, OrderStateTransitionRule>
  allIds: string[]
}

export type OrderStateTransitionRuleCreateFields = {
  client_id?: string
  allowed_state_id?: number | null
  user_role_id: number
}

export type OrderStateTransitionRuleUpdateFields = Partial<OrderStateTransitionRuleCreateFields>

export type ClientIdMap = Record<string, number> & {
  ids_without_match?: number[]
}
