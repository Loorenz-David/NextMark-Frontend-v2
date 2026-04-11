import type { ItemPropertyFormState } from './ItemPropertyForm.types'
import type { ItemPropertyFormWarnings } from './ItemPropertyForm.warnings'

export const useItemPropertyFormValidation = ({
  formState,
  warnings,
}: {
  formState: ItemPropertyFormState
  warnings: ItemPropertyFormWarnings
}) => {
  const validateForm = () => warnings.nameWarning.validate(formState.name)

  return { validateForm }
}
