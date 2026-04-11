import { createContext, useContext } from 'react'
import type { Dispatch, RefObject, SetStateAction } from 'react'

import type { ItemPositionFormPayload, ItemPositionFormState } from './ItemPositionForm.types'
import type { ItemPositionFormWarnings } from './ItemPositionForm.warnings'

type ItemPositionFormContextValue = {
  payload: ItemPositionFormPayload
  formState: ItemPositionFormState
  setFormState: Dispatch<SetStateAction<ItemPositionFormState>>
  initialFormRef: RefObject<ItemPositionFormState | null>
  warnings: ItemPositionFormWarnings
  handleSave: () => void
  handleDelete: () => void
}

const ItemPositionFormContext = createContext<ItemPositionFormContextValue | null>(null)

export const ItemPositionFormContextProvider = ItemPositionFormContext.Provider

export const useItemPositionForm = () => {
  const context = useContext(ItemPositionFormContext)
  if (!context) {
    throw new Error('useItemPositionForm must be used within ItemPositionFormProvider.')
  }
  return context
}
