import type { ItemTypeFormState } from './ItemTypeForm.types'
import type { ItemTypeFormWarnings } from './ItemTypeForm.warnings'

export const useItemTypeFormValidation = ({
  formState,
  warnings,
}: {
  formState: ItemTypeFormState
  warnings: ItemTypeFormWarnings
}) => {
  const validateForm = () => warnings.nameWarning.validate(formState.name)

  return { validateForm }
}
