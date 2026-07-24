import { useCallback } from 'react'

import { useMessageHandler } from '@shared-message-handler'

import { readClientFormFailure } from '../api/clientFormConfigFailure'
import { readCreatedId } from '../api/clientFormCreateResponse'
import {
  useCreateClientFormRule,
  useDeleteClientFormRule,
  useUpdateClientFormRule,
} from '../api/clientFormRules.api'
import {
  readClientFormRules,
  removeClientFormRule,
  upsertClientFormRule,
} from '../store/clientFormRules.store'
import type {
  ClientFormRule,
  ClientFormRuleCreateFields,
  ClientFormRuleUpdateFields,
} from '../types/clientFormRule'

const nextPosition = (rules: ClientFormRule[]) =>
  rules.reduce((highest, rule) => Math.max(highest, rule.position + 1), 0)

export const useSaveClientFormRuleAction = () => {
  const createRuleRequest = useCreateClientFormRule()
  const updateRuleRequest = useUpdateClientFormRule()
  const deleteRuleRequest = useDeleteClientFormRule()
  const { showMessage } = useMessageHandler()

  /** `position` is never sent — the backend appends and answers with the new id. */
  const createRule = useCallback(
    async (fields: ClientFormRuleCreateFields) => {
      const optimistic: ClientFormRule = {
        client_id: fields.client_id,
        position: nextPosition(readClientFormRules()),
        enabled: fields.enabled ?? true,
        title: fields.title,
        body: fields.body ?? null,
        icon: fields.icon ?? null,
        image_url: fields.image_url ?? null,
      }
      upsertClientFormRule(optimistic)

      try {
        const response = await createRuleRequest(fields)
        const serverId = readCreatedId(response.data, fields.client_id)
        if (serverId !== null) {
          upsertClientFormRule({ ...optimistic, id: serverId })
        }
        return true
      } catch (error) {
        console.error('Failed to create client form rule', error)
        removeClientFormRule(fields.client_id)
        showMessage(readClientFormFailure(error, 'Unable to create the rule.'))
        return false
      }
    },
    [createRuleRequest, showMessage],
  )

  const updateRule = useCallback(
    async (rule: ClientFormRule, fields: ClientFormRuleUpdateFields) => {
      if (typeof rule.id !== 'number') {
        showMessage({ status: 400, message: 'This rule is still saving. Try again in a moment.' })
        return false
      }

      const snapshot = { ...rule }
      upsertClientFormRule({ ...rule, ...fields })

      try {
        await updateRuleRequest(rule.id, fields)
        return true
      } catch (error) {
        console.error('Failed to update client form rule', error)
        upsertClientFormRule(snapshot)
        showMessage(readClientFormFailure(error, 'Unable to update the rule.'))
        return false
      }
    },
    [showMessage, updateRuleRequest],
  )

  /**
   * Deleting leaves a gap in `position`; ordering still works, so no reorder is
   * forced on the user afterwards.
   */
  const deleteRule = useCallback(
    async (rule: ClientFormRule) => {
      if (typeof rule.id !== 'number') {
        showMessage({ status: 400, message: 'This rule is still saving. Try again in a moment.' })
        return false
      }

      const snapshot = { ...rule }
      removeClientFormRule(rule.client_id)

      try {
        await deleteRuleRequest(rule.id)
        return true
      } catch (error) {
        console.error('Failed to delete client form rule', error)
        upsertClientFormRule(snapshot)
        showMessage(readClientFormFailure(error, 'Unable to delete the rule.'))
        return false
      }
    },
    [deleteRuleRequest, showMessage],
  )

  return { createRule, updateRule, deleteRule }
}
