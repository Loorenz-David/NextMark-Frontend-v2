import type { Dispatch, SetStateAction } from 'react'

import type { ItemPositionFormState } from './ItemPositionForm.types'
import type { ItemPositionFormWarnings } from './ItemPositionForm.warnings'

export const useItemPositionFormSetters = ({
  setFormState,
  warnings,
}: {
  setFormState: Dispatch<SetStateAction<ItemPositionFormState>>
  warnings: ItemPositionFormWarnings
}) => {
  const handleName = (value: string) => {
    warnings.nameWarning.validate(value)
    setFormState((prev) => ({ ...prev, name: value }))
  }

  const handleDescription = (value: string) =>
    setFormState((prev) => ({ ...prev, description: value }))

  const handleDefault = (value: boolean) =>
    setFormState((prev) => ({ ...prev, default: value }))

  const handleSystem = (value: boolean) =>
    setFormState((prev) => ({ ...prev, is_system: value }))

  return { handleName, handleDescription, handleDefault, handleSystem }
}
