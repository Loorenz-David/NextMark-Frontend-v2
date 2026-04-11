import { useCallback, useEffect } from 'react'

import { useMessageHandler } from '@shared-message-handler'

import { useGetItemTypes } from '../api/itemTypeApi'
import { useItemModel } from '../domain/useItemModel'
import {
  insertItemTypes,
  useItemTypeStore,
} from '../store/itemTypeStore'

export const useItemTypeFlow = () => {
  const getItemTypes = useGetItemTypes()
  const { normalizeItemTypes } = useItemModel()
  const { showMessage } = useMessageHandler()

  const loadItemTypes = useCallback(async () => {
    try {
      const existing = useItemTypeStore.getState()
      if (existing.allIds.length) {
        return { item_types: existing.byClientId }
      }
      const response = await getItemTypes()
      const payload = response.data
      if (!payload?.item_types) {
        showMessage({ status: 500, message: 'Missing item types response.' })
        return null
      }
      const normalized = normalizeItemTypes(payload.item_types)
      if (normalized) {
        insertItemTypes(normalized)
      }
      return payload
    } catch (error) {
      console.error('Failed to load item types', error)
      showMessage({ status: 500, message: 'Unable to load item types.' })
      return null
    }
  }, [getItemTypes, normalizeItemTypes, showMessage])

  useEffect(() => {
    void loadItemTypes()
  }, [loadItemTypes])

  return { loadItemTypes }
}
