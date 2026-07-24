import { useCallback } from 'react'

import { useUpdateClientFormSettingsAction } from '../actions/updateClientFormSettings.action'
import {
  useClientFormSettings,
  useClientFormSettingsLoaded,
} from '../store/clientFormConfig.selector'
import type { ClientFormSettingsFlag } from '../types/clientFormSettings'

export const useClientFormSettingsController = () => {
  const settings = useClientFormSettings()
  const isLoaded = useClientFormSettingsLoaded()
  const updateSettings = useUpdateClientFormSettingsAction()

  const setFlag = useCallback(
    (flag: ClientFormSettingsFlag, value: boolean) => {
      if (settings[flag] === value) {
        return
      }
      void updateSettings({ [flag]: value })
    },
    [settings, updateSettings],
  )

  return { settings, isLoaded, setFlag }
}
