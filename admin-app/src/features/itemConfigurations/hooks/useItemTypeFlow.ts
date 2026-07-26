import { useCallback, useEffect } from 'react'

import { useMessageHandler } from '@shared-message-handler'

import { ensureItemTypesLoaded } from '../flows/ensureItemTypesLoaded.flow'

export const useItemTypeFlow = () => {
  const { showMessage } = useMessageHandler()

  const loadItemTypes = useCallback(async () => {
    try {
      return await ensureItemTypesLoaded()
    } catch (error) {
      console.error('Failed to load item types', error)
      showMessage({ status: 500, message: 'Unable to load item types.' })
      return null
    }
  }, [showMessage])

  useEffect(() => {
    void loadItemTypes()
  }, [loadItemTypes])

  return { loadItemTypes }
}
