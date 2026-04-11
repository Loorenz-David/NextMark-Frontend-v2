export type DateRangeAccessRulePagination = {
  has_more: boolean
  next_cursor: {
    after_id: number
  } | null
  prev_cursor: {
    before_id: number
  } | null
}

export type OrderStateTransitionRulePagination = {
  has_more: boolean
  next_cursor: {
    after_id: number
  } | null
  prev_cursor: {
    before_id: number
  } | null
}

export type DateRangeAccessRuleQueryFilters = {
  team_id?: number | string
  client_id?: string
  user_role_id?: number | string
  target_model?: string
  sort?: 'id_asc' | 'id_desc'
  after_id?: number
  before_id?: number
  limit?: number
}

export type OrderStateTransitionRuleQueryFilters = {
  team_id?: number | string
  client_id?: string
  user_role_id?: number | string
  allowed_state_id?: number | string
  sort?: 'id_asc' | 'id_desc'
  after_id?: number
  before_id?: number
  limit?: number
}

export type UserRoleRuleQueryFilters = DateRangeAccessRuleQueryFilters & OrderStateTransitionRuleQueryFilters
