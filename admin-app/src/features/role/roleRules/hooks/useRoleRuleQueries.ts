import { useCallback } from 'react'

import { ApiError } from '@/lib/api/ApiClient'
import { useMessageHandler } from '@shared-message-handler'

import { roleRuleApi } from '@/features/role/roleRules/api/roleRuleApi'
import type { UserRoleRulesListResponse } from '@/features/role/roleRules/api/roleRuleApi'
import type { UserRoleRuleQueryFilters } from '@/features/role/roleRules/types/roleRuleMeta'
import {
  insertDateRangeAccessRules,
} from '@/features/role/roleRules/store/dateRangeAccessRuleStore'
import {
  insertOrderStateTransitionRules,
} from '@/features/role/roleRules/store/orderStateTransitionRuleStore'
import {
  setDateRangeAccessRuleListError,
  setDateRangeAccessRuleListLoading,
  setDateRangeAccessRuleListResult,
} from '@/features/role/roleRules/store/dateRangeAccessRuleListStore'
import {
  setOrderStateTransitionRuleListError,
  setOrderStateTransitionRuleListLoading,
  setOrderStateTransitionRuleListResult,
} from '@/features/role/roleRules/store/orderStateTransitionRuleListStore'

const buildQueryKey = (query?: UserRoleRuleQueryFilters) => JSON.stringify(query ?? {})

const handleRulesResponse = (
  payload: UserRoleRulesListResponse | null | undefined,
  queryKey: string,
  query?: UserRoleRuleQueryFilters,
) => {
  if (!payload?.date_range_access_rules || !payload?.order_state_transition_rules) {
    console.warn('User role rules response missing rules', payload)
    setDateRangeAccessRuleListError('Missing date range access rules response.')
    setOrderStateTransitionRuleListError('Missing order state transition rules response.')
    return null
  }

  insertDateRangeAccessRules(payload.date_range_access_rules)
  insertOrderStateTransitionRules(payload.order_state_transition_rules)

  setDateRangeAccessRuleListResult({
    queryKey,
    query,
    pagination: payload.date_range_access_rules_pagination,
  })
  setOrderStateTransitionRuleListResult({
    queryKey,
    query,
    pagination: payload.order_state_transition_rules_pagination,
  })

  return payload
}

export function useRoleRuleQueries() {
  const { showMessage } = useMessageHandler()

  const fetchUserRoleRules = useCallback(
    async (query?: UserRoleRuleQueryFilters) => {
      const queryKey = buildQueryKey(query)
      setDateRangeAccessRuleListLoading(true)
      setOrderStateTransitionRuleListLoading(true)
      try {
        const response = await roleRuleApi.listUserRoleRules(query)
        return handleRulesResponse(response.data, queryKey, query)
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Unable to load role rules.'
        const status = error instanceof ApiError ? error.status : 500
        console.error('Failed to fetch user role rules', error)
        setDateRangeAccessRuleListError(message)
        setOrderStateTransitionRuleListError(message)
        showMessage({ status, message })
        return null
      }
    },
    [showMessage],
  )

  const fetchUserRoleRulesByRoleId = useCallback(
    async (roleId: number | string, query?: UserRoleRuleQueryFilters) => {
      const queryKey = buildQueryKey(query)
      setDateRangeAccessRuleListLoading(true)
      setOrderStateTransitionRuleListLoading(true)
      try {
        const response = await roleRuleApi.listUserRoleRulesByRoleId(roleId, query)
        return handleRulesResponse(response.data, queryKey, query)
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Unable to load role rules.'
        const status = error instanceof ApiError ? error.status : 500
        console.error('Failed to fetch user role rules by role', error)
        setDateRangeAccessRuleListError(message)
        setOrderStateTransitionRuleListError(message)
        showMessage({ status, message })
        return null
      }
    },
    [showMessage],
  )

  return {
    fetchUserRoleRules,
    fetchUserRoleRulesByRoleId,
  }
}
