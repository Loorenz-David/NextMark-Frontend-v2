import { createContext, useContext } from 'react'
import type { Dispatch, RefObject, SetStateAction } from 'react'

import type { ItemStateFormPayload, ItemStateFormState } from './ItemStateForm.types'
import type { ItemStateFormWarnings } from './ItemStateForm.warnings'

type ItemStateFormContextValue = {
  payload: ItemStateFormPayload
  formState: ItemStateFormState
  setFormState: Dispatch<SetStateAction<ItemStateFormState>>
  initialFormRef: RefObject<ItemStateFormState | null>
  warnings: ItemStateFormWarnings
  handleSave: () => void
  handleDelete: () => void
}

const ItemStateFormContext = createContext<ItemStateFormContextValue | null>(null)

export const ItemStateFormContextProvider = ItemStateFormContext.Provider

export const useItemStateForm = () => {
  const context = useContext(ItemStateFormContext)
  if (!context) {
    throw new Error('useItemStateForm must be used within ItemStateFormProvider.')
  }
  return context
}
