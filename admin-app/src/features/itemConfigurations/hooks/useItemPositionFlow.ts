import { useCallback, useEffect } from 'react'

import { useMessageHandler } from '@shared-message-handler'

import { useGetItemPositions } from '../api/itemPositionApi'
import { useItemModel } from '../domain/useItemModel'
import { insertItemPositions } from '../store/itemPositionStore'

export const useItemPositionFlow = () => {
  const getItemPositions = useGetItemPositions()
  const { normalizeItemPositions } = useItemModel()
  const { showMessage } = useMessageHandler()

  const loadItemPositions = useCallback(async () => {
    try {
      const response = await getItemPositions()
      const payload = response.data
      if (!payload?.item_positions) {
        showMessage({ status: 500, message: 'Missing item positions response.' })
        return null
      }
      const normalized = normalizeItemPositions(payload.item_positions)
      if (normalized) {
        insertItemPositions(normalized)
      }
      return payload
    } catch (error) {
      console.error('Failed to load item positions', error)
      showMessage({ status: 500, message: 'Unable to load item positions.' })
      return null
    }
  }, [getItemPositions, normalizeItemPositions, showMessage])

  useEffect(() => {
    void loadItemPositions()
  }, [loadItemPositions])

  return { loadItemPositions }
}
