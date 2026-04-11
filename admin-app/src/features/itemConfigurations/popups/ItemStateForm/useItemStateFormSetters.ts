import type { Dispatch, SetStateAction } from 'react'

import type { ItemStateFormState } from './ItemStateForm.types'
import type { ItemStateFormWarnings } from './ItemStateForm.warnings'

export const useItemStateFormSetters = ({
  setFormState,
  warnings,
}: {
  setFormState: Dispatch<SetStateAction<ItemStateFormState>>
  warnings: ItemStateFormWarnings
}) => {
  const handleName = (value: string) => {
    warnings.nameWarning.validate(value)
    setFormState((prev) => ({ ...prev, name: value }))
  }

  const handleColor = (value: string) =>
    setFormState((prev) => ({ ...prev, color: value }))

  const handleDescription = (value: string) =>
    setFormState((prev) => ({ ...prev, description: value }))

  const handleIndex = (value: string) =>
    setFormState((prev) => ({ ...prev, index: value }))

  return {
    handleName,
    handleColor,
    handleDescription,
    handleIndex,
  }
}
