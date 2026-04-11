import { createContext, useContext } from 'react'
import type { Dispatch, RefObject, SetStateAction } from 'react'

import type { InitialFormState, IntegrationConfigPayload, IntegrationConfigSetters } from './IntegrationConfig.types'

type IntegrationConfigContextValue = {
  payload: IntegrationConfigPayload
  formState: InitialFormState
  setFormState: Dispatch<SetStateAction<InitialFormState>>
  initialFormRef: RefObject<InitialFormState | null>
  handleSave: () => void
  setters: IntegrationConfigSetters
}

const IntegrationConfigContext = createContext<IntegrationConfigContextValue | null>(null)

export const IntegrationConfigContextProvider = IntegrationConfigContext.Provider

export const useIntegrationConfig = () => {
  const context = useContext(IntegrationConfigContext)
  if (!context) {
    throw new Error('useIntegrationConfig must be used within IntegrationConfigProvider.')
  }
  return context
}
