import { createContext, useContext } from 'react'
import type { Dispatch, RefObject, SetStateAction } from 'react'

import type { ItemPropertyFormPayload, ItemPropertyFormState } from './ItemPropertyForm.types'
import type { ItemPropertyFormWarnings } from './ItemPropertyForm.warnings'
import type { useItemPropertyFormSetters } from './useItemPropertyFormSetters'
import type { usePropertyItemTypeQuery } from './queries/usePropertyItemTypeQuery'

type ItemPropertyFormContextValue = {
  payload: ItemPropertyFormPayload
  formState: ItemPropertyFormState
  setFormState: Dispatch<SetStateAction<ItemPropertyFormState>>
  initialFormRef: RefObject<ItemPropertyFormState | null>
  warnings: ItemPropertyFormWarnings
  handleSave: () => void
  handleDelete: () => void
  setters: ReturnType<typeof useItemPropertyFormSetters>
  itemTypeQuery: ReturnType<typeof usePropertyItemTypeQuery>
}

const ItemPropertyFormContext = createContext<ItemPropertyFormContextValue | null>(null)

export const ItemPropertyFormContextProvider = ItemPropertyFormContext.Provider

export const useItemPropertyForm = () => {
  const context = useContext(ItemPropertyFormContext)
  if (!context) {
    throw new Error('useItemPropertyForm must be used within ItemPropertyFormProvider.')
  }
  return context
}
