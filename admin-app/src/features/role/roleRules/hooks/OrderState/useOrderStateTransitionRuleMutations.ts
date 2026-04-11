import { useCallback } from 'react'

import { buildClientId } from '@/lib/utils/clientId'
import { ApiError } from '@/lib/api/ApiClient'
import { useMessageHandler } from '@shared-message-handler'

import { roleRuleApi } from '@/features/role/roleRules/api/roleRuleApi'
import type {
  OrderStateTransitionRule,
  OrderStateTransitionRuleCreateFields,
  OrderStateTransitionRuleUpdateFields,
} from '@/features/role/roleRules/types/roleRule'
import {
  insertOrderStateTransitionRule,
  removeOrderStateTransitionRule,
  selectOrderStateTransitionRuleByClientId,
  selectOrderStateTransitionRuleByServerId,
  updateOrderStateTransitionRule,
  useOrderStateTransitionRuleStore,
} from '@/features/role/roleRules/store/orderStateTransitionRuleStore'

const resolveError = (error: unknown, fallback: string) => ({
  message: error instanceof ApiError ? error.message : fallback,
  status: error instanceof ApiError ? error.status : 500,
})

export function useOrderStateTransitionRuleMutations() {
  const { showMessage } = useMessageHandler()

  const createOrderStateTransitionRule = useCallback(
    async (payload: OrderStateTransitionRuleCreateFields) => {
      const clientId = payload.client_id || buildClientId('order_state_transition_rule')

      const optimisticRule: OrderStateTransitionRule = {
        ...payload,
        client_id: clientId,
      }

      insertOrderStateTransitionRule(optimisticRule)

      try {
        const response = await roleRuleApi.createOrderStateTransitionRule({
          ...payload,
          client_id: clientId,
        })

        const ruleId = response.data?.[clientId]
        if (typeof ruleId === 'number') {
          updateOrderStateTransitionRule(clientId, (rule) => ({
            ...rule,
            id: ruleId,
          }))
        }

        return response.data
      } catch (error) {
        const resolved = resolveError(error, 'Unable to create order state transition rule.')
        console.error('Failed to create order state transition rule', error)
        removeOrderStateTransitionRule(clientId)
        showMessage({ status: resolved.status, message: resolved.message })
        return null
      }
    },
    [showMessage],
  )

  const updateOrderStateTransitionRuleInstance = useCallback(
    async (clientId: string, fields: OrderStateTransitionRuleUpdateFields) => {
      const existing = selectOrderStateTransitionRuleByClientId(clientId)(useOrderStateTransitionRuleStore.getState())
      if (!existing) {
        showMessage({ status: 404, message: 'Order state transition rule not found for update.' })
        return null
      }
      if (!existing.id) {
        showMessage({ status: 400, message: 'Order state transition rule must be synced before update.' })
        return null
      }

      const previous = { ...existing }
      updateOrderStateTransitionRule(clientId, (rule) => ({
        ...rule,
        ...(fields as Partial<OrderStateTransitionRule>),
      }))

      try {
        await roleRuleApi.updateOrderStateTransitionRule({
          target_id: existing.id,
          fields,
        })
        return true
      } catch (error) {
        const resolved = resolveError(error, 'Unable to update order state transition rule.')
        console.error('Failed to update order state transition rule', error)
        updateOrderStateTransitionRule(clientId, () => previous)
        showMessage({ status: resolved.status, message: resolved.message })
        return null
      }
    },
    [showMessage],
  )

  const deleteOrderStateTransitionRuleInstance = useCallback(
    async (idOrClientId: number | string) => {
      const rule = typeof idOrClientId === 'number'
        ? selectOrderStateTransitionRuleByServerId(idOrClientId)(useOrderStateTransitionRuleStore.getState())
        : selectOrderStateTransitionRuleByClientId(idOrClientId)(useOrderStateTransitionRuleStore.getState())

      if (!rule) {
        showMessage({ status: 404, message: 'Order state transition rule not found for deletion.' })
        return null
      }

      if (!rule.id) {
        showMessage({ status: 400, message: 'Order state transition rule must be synced before deletion.' })
        return null
      }

      const previous = { ...rule }
      removeOrderStateTransitionRule(rule.client_id)

      try {
        await roleRuleApi.deleteOrderStateTransitionRule({ target_id: rule.id })
        return true
      } catch (error) {
        const resolved = resolveError(error, 'Unable to delete order state transition rule.')
        console.error('Failed to delete order state transition rule', error)
        insertOrderStateTransitionRule(previous)
        showMessage({ status: resolved.status, message: resolved.message })
        return null
      }
    },
    [showMessage],
  )

  return {
    createOrderStateTransitionRule,
    updateOrderStateTransitionRule: updateOrderStateTransitionRuleInstance,
    deleteOrderStateTransitionRule: deleteOrderStateTransitionRuleInstance,
  }
}
