import { useCallback } from 'react'

import { normalizeEntityMap } from '@/lib/utils/entities/normalizeEntityMap'
import { ApiError } from '@/lib/api/ApiClient'
import { useMessageHandler } from '@shared-message-handler'

import { roleRuleApi } from '@/features/role/roleRules/api/roleRuleApi'
import type { OrderStateTransitionRule, OrderStateTransitionRuleMap } from '@/features/role/roleRules/types/roleRule'
import type { OrderStateTransitionRuleQueryFilters } from '@/features/role/roleRules/types/roleRuleMeta'
import {
  insertOrderStateTransitionRules,
  upsertOrderStateTransitionRule,
} from '@/features/role/roleRules/store/orderStateTransitionRuleStore'
import {
  setOrderStateTransitionRuleListError,
  setOrderStateTransitionRuleListLoading,
  setOrderStateTransitionRuleListResult,
} from '@/features/role/roleRules/store/orderStateTransitionRuleListStore'

const buildQueryKey = (query?: OrderStateTransitionRuleQueryFilters) => JSON.stringify(query ?? {})

export function useOrderStateTransitionRuleQueries() {
  const { showMessage } = useMessageHandler()

  const fetchOrderStateTransitionRules = useCallback(
    async (query?: OrderStateTransitionRuleQueryFilters) => {
      const queryKey = buildQueryKey(query)
      setOrderStateTransitionRuleListLoading(true)
      try {
        const response = await roleRuleApi.listOrderStateTransitionRules(query)
        const payload = response.data

        if (!payload?.order_state_transition_rules) {
          console.warn('Order state transition rules response missing order_state_transition_rules', payload)
          setOrderStateTransitionRuleListError('Missing order state transition rules response.')
          return null
        }

        insertOrderStateTransitionRules(payload.order_state_transition_rules)
        setOrderStateTransitionRuleListResult({
          queryKey,
          query,
          pagination: payload.order_state_transition_rules_pagination,
        })

        return payload
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Unable to load order state transition rules.'
        const status = error instanceof ApiError ? error.status : 500
        console.error('Failed to fetch order state transition rules', error)
        setOrderStateTransitionRuleListError(message)
        showMessage({ status, message })
        return null
      }
    },
    [showMessage],
  )

  const fetchOrderStateTransitionRuleById = useCallback(
    async (ruleId: number | string) => {
      try {
        const response = await roleRuleApi.getOrderStateTransitionRule(ruleId)
        const payload = response.data

        const normalized = normalizeEntityMap<OrderStateTransitionRule>(
          payload?.order_state_transition_rule as OrderStateTransitionRuleMap | OrderStateTransitionRule,
        )
        if (!normalized) {
          console.warn('Order state transition rule response missing order_state_transition_rule', payload)
          return null
        }

        normalized.allIds.forEach((clientId) => {
          const rule = normalized.byClientId[clientId]
          if (rule) {
            upsertOrderStateTransitionRule(rule)
          }
        })

        return normalized
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Unable to load order state transition rule.'
        const status = error instanceof ApiError ? error.status : 500
        console.error('Failed to fetch order state transition rule', error)
        showMessage({ status, message })
        return null
      }
    },
    [showMessage],
  )

  return {
    fetchOrderStateTransitionRules,
    fetchOrderStateTransitionRuleById,
  }
}
