import type { Dispatch, SetStateAction } from 'react'

import type { ItemPropertyFormState } from './ItemPropertyForm.types'
import type { ItemPropertyFormWarnings } from './ItemPropertyForm.warnings'
import type { ItemPropertyFieldType } from '../../types/itemProperty'

export const useItemPropertyFormSetters = ({
  setFormState,
  warnings,
}: {
  setFormState: Dispatch<SetStateAction<ItemPropertyFormState>>
  warnings: ItemPropertyFormWarnings
}) => {
  const handleName = (value: string) => {
    warnings.nameWarning.validate(value)
    setFormState((prev) => ({ ...prev, name: value }))
  }

  const handleFieldType = (value: ItemPropertyFieldType) =>
    setFormState((prev) => ({ ...prev, field_type: value }))

  const handleOptions = (value: string,action:'add' | 'remove') =>
    setFormState((prev) => ({ 
      ...prev,
      options: action == 'add'
      ? prev.options.includes(value)
        ? prev.options
        : [...prev.options, value]
      : [...prev.options.filter(p => p !== value)]
     }))

  const handleRequired = (value: boolean) =>
    setFormState((prev) => ({ ...prev, required: value }))

  const handleItemTypes = (value: number, action: 'add' | 'remove') =>
    setFormState((prev) => ({
      ...prev,
      item_types: action == 'add'
      ? prev.item_types.includes(value)
        ? prev.item_types
        : [...prev.item_types, value]
      : [...prev.item_types.filter(p => p !== value)]
    }))

    const handleInputType = (value: ItemPropertyFieldType | null) =>{
      if (value === null) return
      setFormState((prev) => ({ ...prev, field_type: value }))
    }

  return {
    handleName,
    handleFieldType,
    handleOptions,
    handleRequired,
    handleItemTypes,
    handleInputType,
  }
}
