import { useCallback, useEffect } from 'react'

import { useMessageHandler } from '@shared-message-handler'

import { readClientFormFailure } from '../api/clientFormConfigFailure'
import { useGetClientFormSettings } from '../api/clientFormSettings.api'
import { setClientFormSettings } from '../store/clientFormSettings.store'

export const useClientFormSettingsFlow = () => {
  const getSettings = useGetClientFormSettings()
  const { showMessage } = useMessageHandler()

  const loadSettings = useCallback(async () => {
    try {
      const response = await getSettings()
      const settings = response.data?.client_form_settings
      if (!settings) {
        showMessage({ status: 500, message: 'Missing client form settings response.' })
        return null
      }
      // `id: null` is the documented pre-first-save state, not a missing row.
      setClientFormSettings(settings)
      return settings
    } catch (error) {
      console.error('Failed to load client form settings', error)
      showMessage(readClientFormFailure(error, 'Unable to load the client form settings.'))
      return null
    }
  }, [getSettings, showMessage])

  useEffect(() => {
    void loadSettings()
  }, [loadSettings])

  return { loadSettings }
}
