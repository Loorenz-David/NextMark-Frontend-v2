import { useCallback, useEffect } from 'react'

import { useMessageHandler } from '@shared-message-handler'

import { useGetItemStates } from '../api/itemStateApi'
import { useItemModel } from '../domain/useItemModel'
import { insertItemStates } from '../store/itemStateStore'

export const useItemStateFlow = () => {
  const getItemStates = useGetItemStates()
  const { normalizeItemStates } = useItemModel()
  const { showMessage } = useMessageHandler()

  const loadItemStates = useCallback(async () => {
    try {
      const response = await getItemStates({ include_defaults: true })
      const payload = response.data
      if (!payload?.item_states) {
        showMessage({ status: 500, message: 'Missing item states response.' })
        return null
      }
      const normalized = normalizeItemStates(payload.item_states)
      if (normalized) {
        insertItemStates(normalized)
      }
      return payload
    } catch (error) {
      console.error('Failed to load item states', error)
      showMessage({ status: 500, message: 'Unable to load item states.' })
      return null
    }
  }, [getItemStates, normalizeItemStates, showMessage])

  useEffect(() => {
    void loadItemStates()
  }, [])

  return { loadItemStates }
}
