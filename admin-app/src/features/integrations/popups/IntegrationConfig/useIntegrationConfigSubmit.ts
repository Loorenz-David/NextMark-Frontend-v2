import { useCallback } from 'react'

import { useIntegrationsController } from '../../hooks/useIntegrationsController'
import type { InitialFormState, IntegrationConfigPayload } from './IntegrationConfig.types'

export const useIntegrationConfigSubmit = ({
  payload,
  validateForm,
  formState
}: {
  payload: IntegrationConfigPayload
  validateForm: () => boolean
  formState: InitialFormState
}) => {
  const { saveIntegration, updateIntegration } = useIntegrationsController()

  const handleSave = useCallback(async () => {
    const isValid = validateForm()
    if (!isValid) {
      return
    }
   
    if (payload.mode === 'create') {
      await saveIntegration({
        key:payload.integrationKey,
        form:formState
      })
      return
    }

    await updateIntegration({
      key:payload.integrationKey,
      form:formState,
      integrationId: payload.integrationId,
    })
  }, [payload.integrationKey, payload.integrationId, payload.mode, saveIntegration, updateIntegration, validateForm])

  return { handleSave }
}
