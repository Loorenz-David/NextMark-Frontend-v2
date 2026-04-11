import { useCallback, useEffect } from 'react'

import { useMessageHandler } from '@shared-message-handler'

import { useGetItemProperties } from '../api/itemPropertyApi'
import { useItemModel } from '../domain/useItemModel'
import {
  insertItemProperties,
  useItemPropertyStore,
} from '../store/itemPropertyStore'

export const useItemPropertyFlow = () => {
  const getItemProperties = useGetItemProperties()
  const { normalizeItemProperties } = useItemModel()
  const { showMessage } = useMessageHandler()

  const loadItemProperties = useCallback(async () => {
    try {
      const existing = useItemPropertyStore.getState()
      if (existing.allIds.length) {
        return { item_properties: existing.byClientId }
      }
      const response = await getItemProperties()
      const payload = response.data
      if (!payload?.item_properties) {
        showMessage({ status: 500, message: 'Missing item properties response.' })
        return null
      }
      const normalized = normalizeItemProperties(payload.item_properties)
      if (normalized) {
        insertItemProperties(normalized)
      }
      return payload
    } catch (error) {
      console.error('Failed to load item properties', error)
      showMessage({ status: 500, message: 'Unable to load item properties.' })
      return null
    }
  }, [getItemProperties, normalizeItemProperties, showMessage])

  useEffect(() => {
    void loadItemProperties()
  }, [loadItemProperties])

  return { loadItemProperties }
}
