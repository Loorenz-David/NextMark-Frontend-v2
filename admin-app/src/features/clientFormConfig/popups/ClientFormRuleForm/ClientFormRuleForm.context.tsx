import { createContext, useContext } from 'react'
import type { Dispatch, RefObject, SetStateAction } from 'react'

import type { ClientFormRuleFormPayload, ClientFormRuleFormState } from './ClientFormRuleForm.types'
import type { ClientFormRuleFormWarnings } from './ClientFormRuleForm.warnings'

type ClientFormRuleFormContextValue = {
  payload: ClientFormRuleFormPayload
  formState: ClientFormRuleFormState
  setFormState: Dispatch<SetStateAction<ClientFormRuleFormState>>
  initialFormRef: RefObject<ClientFormRuleFormState | null>
  warnings: ClientFormRuleFormWarnings
  handleSave: () => void
  handleDelete: () => void
}

const ClientFormRuleFormContext = createContext<ClientFormRuleFormContextValue | null>(null)

export const ClientFormRuleFormContextProvider = ClientFormRuleFormContext.Provider

export const useClientFormRuleForm = () => {
  const context = useContext(ClientFormRuleFormContext)
  if (!context) {
    throw new Error('useClientFormRuleForm must be used within ClientFormRuleFormProvider.')
  }
  return context
}
