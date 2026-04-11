import { useCallback } from 'react'

import { buildClientId } from '@/lib/utils/clientId'
import { ApiError } from '@/lib/api/ApiClient'
import { useMessageHandler } from '@shared-message-handler'

import { roleRuleApi } from '@/features/role/roleRules/api/roleRuleApi'
import type {
  DateRangeAccessRule,
  DateRangeAccessRuleCreateFields,
  DateRangeAccessRuleUpdateFields,
} from '@/features/role/roleRules/types/roleRule'
import {
  insertDateRangeAccessRule,
  removeDateRangeAccessRule,
  selectDateRangeAccessRuleByClientId,
  selectDateRangeAccessRuleByServerId,
  updateDateRangeAccessRule,
  useDateRangeAccessRuleStore,
} from '@/features/role/roleRules/store/dateRangeAccessRuleStore'

const resolveError = (error: unknown, fallback: string) => ({
  message: error instanceof ApiError ? error.message : fallback,
  status: error instanceof ApiError ? error.status : 500,
})

export function useDateRangeAccessRuleMutations() {
  const { showMessage } = useMessageHandler()

  const createDateRangeAccessRule = useCallback(
    async (payload: DateRangeAccessRuleCreateFields) => {
      const clientId = payload.client_id || buildClientId('date_range_access_rule')

      const optimisticRule: DateRangeAccessRule = {
        ...payload,
        client_id: clientId,
      }

      insertDateRangeAccessRule(optimisticRule)

      try {
        const response = await roleRuleApi.createDateRangeAccessRule({
          ...payload,
          client_id: clientId,
        })

        const ruleId = response.data?.[clientId]
        if (typeof ruleId === 'number') {
          updateDateRangeAccessRule(clientId, (rule) => ({
            ...rule,
            id: ruleId,
          }))
        }

        return response.data
      } catch (error) {
        const resolved = resolveError(error, 'Unable to create date range rule.')
        console.error('Failed to create date range access rule', error)
        removeDateRangeAccessRule(clientId)
        showMessage({ status: resolved.status, message: resolved.message })
        return null
      }
    },
    [showMessage],
  )

  const updateDateRangeAccessRuleInstance = useCallback(
    async (clientId: string, fields: DateRangeAccessRuleUpdateFields) => {
      const existing = selectDateRangeAccessRuleByClientId(clientId)(useDateRangeAccessRuleStore.getState())
      if (!existing) {
        showMessage({ status: 404, message: 'Date range rule not found for update.' })
        return null
      }
      if (!existing.id) {
        showMessage({ status: 400, message: 'Date range rule must be synced before update.' })
        return null
      }

      const previous = { ...existing }
      updateDateRangeAccessRule(clientId, (rule) => ({
        ...rule,
        ...(fields as Partial<DateRangeAccessRule>),
      }))

      try {
        await roleRuleApi.updateDateRangeAccessRule({
          target_id: existing.id,
          fields,
        })
        return true
      } catch (error) {
        const resolved = resolveError(error, 'Unable to update date range rule.')
        console.error('Failed to update date range access rule', error)
        updateDateRangeAccessRule(clientId, () => previous)
        showMessage({ status: resolved.status, message: resolved.message })
        return null
      }
    },
    [showMessage],
  )

  const deleteDateRangeAccessRuleInstance = useCallback(
    async (idOrClientId: number | string) => {
      const rule = typeof idOrClientId === 'number'
        ? selectDateRangeAccessRuleByServerId(idOrClientId)(useDateRangeAccessRuleStore.getState())
        : selectDateRangeAccessRuleByClientId(idOrClientId)(useDateRangeAccessRuleStore.getState())

      if (!rule) {
        showMessage({ status: 404, message: 'Date range rule not found for deletion.' })
        return null
      }

      if (!rule.id) {
        showMessage({ status: 400, message: 'Date range rule must be synced before deletion.' })
        return null
      }

      const previous = { ...rule }
      removeDateRangeAccessRule(rule.client_id)

      try {
        await roleRuleApi.deleteDateRangeAccessRule({ target_id: rule.id })
        return true
      } catch (error) {
        const resolved = resolveError(error, 'Unable to delete date range rule.')
        console.error('Failed to delete date range access rule', error)
        insertDateRangeAccessRule(previous)
        showMessage({ status: resolved.status, message: resolved.message })
        return null
      }
    },
    [showMessage],
  )

  return {
    createDateRangeAccessRule,
    updateDateRangeAccessRule: updateDateRangeAccessRuleInstance,
    deleteDateRangeAccessRule: deleteDateRangeAccessRuleInstance,
  }
}
