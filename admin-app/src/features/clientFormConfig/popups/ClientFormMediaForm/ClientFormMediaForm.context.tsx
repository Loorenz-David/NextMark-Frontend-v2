import { createContext, useContext } from 'react'
import type { Dispatch, RefObject, SetStateAction } from 'react'

import type {
  ClientFormMediaFormPayload,
  ClientFormMediaFormState,
} from './ClientFormMediaForm.types'
import type { ClientFormMediaFormWarnings } from './ClientFormMediaForm.warnings'

type ClientFormMediaFormContextValue = {
  payload: ClientFormMediaFormPayload
  formState: ClientFormMediaFormState
  setFormState: Dispatch<SetStateAction<ClientFormMediaFormState>>
  initialFormRef: RefObject<ClientFormMediaFormState | null>
  warnings: ClientFormMediaFormWarnings
  handleSave: () => void
  handleDelete: () => void
}

export const ClientFormMediaFormContext = createContext<ClientFormMediaFormContextValue | null>(null)


export const useClientFormMediaForm = () => {
  const context = useContext(ClientFormMediaFormContext)
  if (!context) {
    throw new Error('useClientFormMediaForm must be used within ClientFormMediaFormProvider.')
  }
  return context
}
