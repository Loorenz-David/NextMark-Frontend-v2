import { useCallback } from 'react'

import { useMessageHandler } from '@shared-message-handler'

import { readClientFormFailure } from '../api/clientFormConfigFailure'
import { useReorderClientFormRules } from '../api/clientFormRules.api'
import { collectReorderIds } from '../domain/clientFormConfig.rules'
import { readClientFormRules, upsertClientFormRule } from '../store/clientFormRules.store'
import type { ClientFormRule } from '../types/clientFormRule'

/**
 * The endpoint rewrites positions to `0..n` from the ids it is given and rejects
 * anything but the complete team list, so `orderedRules` must be the full list.
 */
export const useReorderClientFormRulesAction = () => {
  const reorderRules = useReorderClientFormRules()
  const { showMessage } = useMessageHandler()

  return useCallback(
    async (orderedRules: ClientFormRule[]) => {
      const orderedIds = collectReorderIds(orderedRules)
      if (!orderedIds) {
        showMessage({
          status: 400,
          message: 'Wait for every rule to finish saving before reordering.',
        })
        return false
      }

      const snapshot = readClientFormRules()
      orderedRules.forEach((rule, index) => upsertClientFormRule({ ...rule, position: index }))

      try {
        await reorderRules(orderedIds)
        return true
      } catch (error) {
        console.error('Failed to reorder client form rules', error)
        snapshot.forEach((rule) => upsertClientFormRule(rule))
        showMessage(readClientFormFailure(error, 'Unable to reorder the rules.'))
        return false
      }
    },
    [reorderRules, showMessage],
  )
}
