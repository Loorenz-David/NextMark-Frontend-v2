import { createContext, useContext } from 'react'
import type { Dispatch, RefObject, SetStateAction } from 'react'

import type {
  ClientFormRedirectFormPayload,
  ClientFormRedirectFormState,
} from './ClientFormRedirectForm.types'
import type { ClientFormRedirectFormWarnings } from './ClientFormRedirectForm.warnings'

type ClientFormRedirectFormContextValue = {
  payload: ClientFormRedirectFormPayload
  formState: ClientFormRedirectFormState
  setFormState: Dispatch<SetStateAction<ClientFormRedirectFormState>>
  initialFormRef: RefObject<ClientFormRedirectFormState | null>
  warnings: ClientFormRedirectFormWarnings
  handleSave: () => void
  handleDelete: () => void
}

const ClientFormRedirectFormContext = createContext<ClientFormRedirectFormContextValue | null>(
  null,
)

export const ClientFormRedirectFormContextProvider = ClientFormRedirectFormContext.Provider

export const useClientFormRedirectForm = () => {
  const context = useContext(ClientFormRedirectFormContext)
  if (!context) {
    throw new Error('useClientFormRedirectForm must be used within ClientFormRedirectFormProvider.')
  }
  return context
}
