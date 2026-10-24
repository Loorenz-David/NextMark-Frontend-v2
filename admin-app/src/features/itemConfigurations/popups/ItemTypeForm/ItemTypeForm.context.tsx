import { createContext, useContext } from 'react'
import type { Dispatch, RefObject, SetStateAction } from 'react'

import type { ItemTypeFormPayload, ItemTypeFormState } from './ItemTypeForm.types'
import type { ItemTypeFormWarnings } from './ItemTypeForm.warnings'

type ItemTypeFormContextValue = {
  payload: ItemTypeFormPayload
  formState: ItemTypeFormState
  setFormState: Dispatch<SetStateAction<ItemTypeFormState>>
  initialFormRef: RefObject<ItemTypeFormState | null>
  warnings: ItemTypeFormWarnings
  handleSave: () => void
  handleDelete: () => void
}

export const ItemTypeFormContext = createContext<ItemTypeFormContextValue | null>(null)


export const useItemTypeForm = () => {
  const context = useContext(ItemTypeFormContext)
  if (!context) {
    throw new Error('useItemTypeForm must be used within ItemTypeFormProvider.')
  }
  return context
}
