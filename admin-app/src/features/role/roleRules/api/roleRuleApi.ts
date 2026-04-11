import { apiClient } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'
import type {
  ClientIdMap,
  DateRangeAccessRule,
  DateRangeAccessRuleCreateFields,
  DateRangeAccessRuleUpdateFields,
  DateRangeAccessRuleMap,
  OrderStateTransitionRule,
  OrderStateTransitionRuleCreateFields,
  OrderStateTransitionRuleUpdateFields,
  OrderStateTransitionRuleMap,
} from '@/features/role/roleRules/types/roleRule'
import type {
  DateRangeAccessRulePagination,
  DateRangeAccessRuleQueryFilters,
  OrderStateTransitionRulePagination,
  OrderStateTransitionRuleQueryFilters,
  UserRoleRuleQueryFilters,
} from '@/features/role/roleRules/types/roleRuleMeta'

export type UserRoleRulesListResponse = {
  date_range_access_rules: DateRangeAccessRuleMap
  date_range_access_rules_pagination: DateRangeAccessRulePagination
  order_state_transition_rules: OrderStateTransitionRuleMap
  order_state_transition_rules_pagination: OrderStateTransitionRulePagination
}

export type DateRangeAccessRuleListResponse = {
  date_range_access_rules: DateRangeAccessRuleMap
  date_range_access_rules_pagination: DateRangeAccessRulePagination
}

export type OrderStateTransitionRuleListResponse = {
  order_state_transition_rules: OrderStateTransitionRuleMap
  order_state_transition_rules_pagination: OrderStateTransitionRulePagination
}

export type DateRangeAccessRuleDetailResponse = {
  date_range_access_rule: DateRangeAccessRuleMap | DateRangeAccessRule
}

export type OrderStateTransitionRuleDetailResponse = {
  order_state_transition_rule: OrderStateTransitionRuleMap | OrderStateTransitionRule
}

export type DateRangeAccessRuleUpdatePayload = {
  target_id: number | string
  fields: DateRangeAccessRuleUpdateFields
}

export type OrderStateTransitionRuleUpdatePayload = {
  target_id: number | string
  fields: OrderStateTransitionRuleUpdateFields
}

export type RoleRuleDeletePayload = {
  target_id?: number | string
  target_ids?: Array<number | string>
}

export const roleRuleApi = {
  listUserRoleRules: (query?: UserRoleRuleQueryFilters): Promise<ApiResult<UserRoleRulesListResponse>> =>
    apiClient.request<UserRoleRulesListResponse>({
      path: '/user_role_rules/',
      method: 'GET',
      query,
    }),

  listUserRoleRulesByRoleId: (roleId: number | string, query?: UserRoleRuleQueryFilters): Promise<ApiResult<UserRoleRulesListResponse>> =>
    apiClient.request<UserRoleRulesListResponse>({
      path: `/user_role_rules/${roleId}/`,
      method: 'GET',
      query,
    }),

  listUserRoleRulesForRole: (roleId: number | string, query?: UserRoleRuleQueryFilters): Promise<ApiResult<UserRoleRulesListResponse>> =>
    apiClient.request<UserRoleRulesListResponse>({
      path: `/user_roles/${roleId}/rules/`,
      method: 'GET',
      query,
    }),

  listDateRangeAccessRules: (query?: DateRangeAccessRuleQueryFilters): Promise<ApiResult<DateRangeAccessRuleListResponse>> =>
    apiClient.request<DateRangeAccessRuleListResponse>({
      path: '/user_role_rules/date_range/',
      method: 'GET',
      query,
    }),

  getDateRangeAccessRule: (ruleId: number | string): Promise<ApiResult<DateRangeAccessRuleDetailResponse>> =>
    apiClient.request<DateRangeAccessRuleDetailResponse>({
      path: `/user_role_rules/date_range/${ruleId}`,
      method: 'GET',
    }),

  createDateRangeAccessRule: (payload: DateRangeAccessRuleCreateFields | DateRangeAccessRuleCreateFields[]): Promise<ApiResult<ClientIdMap>> =>
    apiClient.request<ClientIdMap>({
      path: '/user_role_rules/date_range/',
      method: 'PUT',
      data: { fields: payload },
    }),

  updateDateRangeAccessRule: (payload: DateRangeAccessRuleUpdatePayload | DateRangeAccessRuleUpdatePayload[]): Promise<ApiResult<Record<string, never>>> =>
    apiClient.request<Record<string, never>>({
      path: '/user_role_rules/date_range/',
      method: 'PATCH',
      data: { target: payload },
    }),

  deleteDateRangeAccessRule: (payload: RoleRuleDeletePayload): Promise<ApiResult<Record<string, never>>> =>
    apiClient.request<Record<string, never>>({
      path: '/user_role_rules/date_range/',
      method: 'DELETE',
      data: payload,
    }),

  listOrderStateTransitionRules: (
    query?: OrderStateTransitionRuleQueryFilters,
  ): Promise<ApiResult<OrderStateTransitionRuleListResponse>> =>
    apiClient.request<OrderStateTransitionRuleListResponse>({
      path: '/user_role_rules/order_state/',
      method: 'GET',
      query,
    }),

  getOrderStateTransitionRule: (ruleId: number | string): Promise<ApiResult<OrderStateTransitionRuleDetailResponse>> =>
    apiClient.request<OrderStateTransitionRuleDetailResponse>({
      path: `/user_role_rules/order_state/${ruleId}`,
      method: 'GET',
    }),

  createOrderStateTransitionRule: (
    payload: OrderStateTransitionRuleCreateFields | OrderStateTransitionRuleCreateFields[],
  ): Promise<ApiResult<ClientIdMap>> =>
    apiClient.request<ClientIdMap>({
      path: '/user_role_rules/order_state/',
      method: 'PUT',
      data: { fields: payload },
    }),

  updateOrderStateTransitionRule: (
    payload: OrderStateTransitionRuleUpdatePayload | OrderStateTransitionRuleUpdatePayload[],
  ): Promise<ApiResult<Record<string, never>>> =>
    apiClient.request<Record<string, never>>({
      path: '/user_role_rules/order_state/',
      method: 'PATCH',
      data: { target: payload },
    }),

  deleteOrderStateTransitionRule: (payload: RoleRuleDeletePayload): Promise<ApiResult<Record<string, never>>> =>
    apiClient.request<Record<string, never>>({
      path: '/user_role_rules/order_state/',
      method: 'DELETE',
      data: payload,
    }),
}
