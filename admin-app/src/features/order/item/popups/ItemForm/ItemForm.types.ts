import type { Dispatch, RefObject, SetStateAction } from 'react'

import type { Item, ItemPopupPayload } from '../../types'
import type { useItemFormWarnings } from './ItemForm.warnings'
import type { useItemFormSubmit } from './useItemFormSubmit'
import type { useItemFormSetters } from './useItemFormSetters'
import type { itemPositionOption, itemTypeOption, selectedItemTypeProperties } from './useItemConfigurations'

export type ItemFormWarnings = ReturnType<typeof useItemFormWarnings>

export type ItemFormSubmitters = ReturnType<typeof useItemFormSubmit>

export type ItemFormContextValue = {
  payload: ItemPopupPayload
  currentItem: Item | null
  formState: Item
  hasUnsavedChanges: boolean
  setFormState: Dispatch<SetStateAction<Item>>
  initialFormRef: RefObject<Item | null>
  warnings: ItemFormWarnings
  setters: ReturnType<typeof useItemFormSetters>
  itemTypeOptions: itemTypeOption[]
  itemPositionOptions: itemPositionOption[]
  selectedItemTypeProperties: selectedItemTypeProperties
} & ItemFormSubmitters
