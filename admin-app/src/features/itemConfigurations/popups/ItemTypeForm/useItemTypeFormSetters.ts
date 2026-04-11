import type { Dispatch, SetStateAction } from 'react'

import type { ItemTypeFormState } from './ItemTypeForm.types'
import type { ItemTypeFormWarnings } from './ItemTypeForm.warnings'

export const useItemTypeFormSetters = ({
  setFormState,
  warnings,
}: {
  setFormState: Dispatch<SetStateAction<ItemTypeFormState>>
  warnings: ItemTypeFormWarnings
}) => {
  const handleName = (value: string) => {
    warnings.nameWarning.validate(value)
    setFormState((prev) => ({ ...prev, name: value }))
  }

 
  const handleProperties = (value: number, action:'remove' |'add') =>
    setFormState((prev) => ({
      ...prev,
      properties:
      action == 'add'
      ? prev.properties.includes(value)
        ? prev.properties 
        : [...prev.properties, value]
      : prev.properties.filter(p => p !== value )
    }))

  return { handleName, handleProperties }
}
