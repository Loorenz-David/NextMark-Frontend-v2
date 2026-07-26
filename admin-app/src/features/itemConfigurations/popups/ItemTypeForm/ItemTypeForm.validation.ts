import type { ItemTypeFormState } from './ItemTypeForm.types'
import type { ItemTypeFormWarnings } from './ItemTypeForm.warnings'

export const useItemTypeFormValidation = ({
  formState,
  warnings,
}: {
  formState: ItemTypeFormState
  warnings: ItemTypeFormWarnings
}) => {
  const validateForm = () => {
    const nameIsValid = warnings.nameWarning.validate(formState.name)
    const labelMultiplierIsValid = warnings.labelMultiplierWarning.validate(
      formState.label_multiplier,
    )

    return nameIsValid && labelMultiplierIsValid
  }

  return { validateForm }
}
