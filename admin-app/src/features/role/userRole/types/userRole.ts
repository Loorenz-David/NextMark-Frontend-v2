import type {
  DateRangeAccessRuleCreateFields,
  OrderStateTransitionRuleCreateFields,
} from '@/features/role/roleRules/types/roleRule'

export type UserRole = {
  id?: number
  client_id: string
  role_name: string
  description?: string | null
  is_system?: boolean
  base_role_id?: number | null
}

export type UserRoleMap = {
  byClientId: Record<string, UserRole>
  allIds: string[]
}

export type UserRoleFields = {
  client_id?: string
  role_name: string
  description?: string | null
  is_system?: boolean
  base_role_id: number
  date_range_access_rule?: DateRangeAccessRuleCreateFields
  order_state_transition_rule?: OrderStateTransitionRuleCreateFields
}

export type UserRoleUpdateFields = Partial<Omit<UserRoleFields, 'date_range_access_rule' | 'order_state_transition_rule'>>

export type ClientIdMap = Record<string, number> & {
  ids_without_match?: number[]
}
