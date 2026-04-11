import type { ItemStateFormState } from './ItemStateForm.types'
import type { ItemStateFormWarnings } from './ItemStateForm.warnings'

export const useItemStateFormValidation = ({
  formState,
  warnings,
}: {
  formState: ItemStateFormState
  warnings: ItemStateFormWarnings
}) => {
  const validateForm = () => warnings.nameWarning.validate(formState.name)

  return { validateForm }
}
