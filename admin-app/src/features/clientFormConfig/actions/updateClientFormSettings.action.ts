import { useCallback } from 'react'

import { useMessageHandler } from '@shared-message-handler'

import { readClientFormFailure } from '../api/clientFormConfigFailure'
import { useUpdateClientFormSettings } from '../api/clientFormSettings.api'
import {
  patchClientFormSettings,
  readClientFormSettings,
  setClientFormSettings,
} from '../store/clientFormSettings.store'
import type { ClientFormSettingsFields } from '../types/clientFormSettings'

/**
 * Optimistically flips the requested flags, then upserts them. The PATCH is
 * partial, so only the changed flags are ever sent.
 */
export const useUpdateClientFormSettingsAction = () => {
  const updateSettings = useUpdateClientFormSettings()
  const { showMessage } = useMessageHandler()

  return useCallback(
    async (fields: ClientFormSettingsFields) => {
      const snapshot = readClientFormSettings()
      patchClientFormSettings(fields)

      try {
        const response = await updateSettings(fields)
        const id = response.data?.id
        if (typeof id === 'number') {
          patchClientFormSettings({ id })
        }
        return true
      } catch (error) {
        console.error('Failed to update client form settings', error)
        setClientFormSettings(snapshot)
        showMessage(readClientFormFailure(error, 'Unable to update the client form settings.'))
        return false
      }
    },
    [showMessage, updateSettings],
  )
}
