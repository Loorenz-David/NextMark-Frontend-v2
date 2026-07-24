import { useCallback, useEffect } from 'react'

import { useMessageHandler } from '@shared-message-handler'

import { readClientFormFailure } from '../api/clientFormConfigFailure'
import { useGetClientFormRules } from '../api/clientFormRules.api'
import { replaceClientFormRules } from '../store/clientFormRules.store'

export const useClientFormRulesFlow = () => {
  const getRules = useGetClientFormRules()
  const { showMessage } = useMessageHandler()

  const loadRules = useCallback(async () => {
    try {
      const response = await getRules()
      const rules = response.data?.client_form_rules
      if (!rules) {
        showMessage({ status: 500, message: 'Missing client form rules response.' })
        return null
      }
      // The list is the whole team collection, so it replaces rather than merges.
      replaceClientFormRules(rules)
      return rules
    } catch (error) {
      console.error('Failed to load client form rules', error)
      showMessage(readClientFormFailure(error, 'Unable to load the rules.'))
      return null
    }
  }, [getRules, showMessage])

  useEffect(() => {
    void loadRules()
  }, [loadRules])

  return { loadRules }
}
