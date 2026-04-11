import type { ItemPositionFormState } from './ItemPositionForm.types'
import type { ItemPositionFormWarnings } from './ItemPositionForm.warnings'

export const useItemPositionFormValidation = ({
  formState,
  warnings,
}: {
  formState: ItemPositionFormState
  warnings: ItemPositionFormWarnings
}) => {
  const validateForm = () => warnings.nameWarning.validate(formState.name)

  return { validateForm }
}
