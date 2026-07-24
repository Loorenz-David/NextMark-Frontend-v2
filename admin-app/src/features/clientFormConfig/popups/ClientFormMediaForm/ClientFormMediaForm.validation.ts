import type { ClientFormMediaFormState } from './ClientFormMediaForm.types'
import type { ClientFormMediaFormWarnings } from './ClientFormMediaForm.warnings'

export const useClientFormMediaFormValidation = ({
  formState,
  warnings,
}: {
  formState: ClientFormMediaFormState
  warnings: ClientFormMediaFormWarnings
}) => {
  const validateForm = () => warnings.urlWarning.validate(formState.url)

  return { validateForm }
}
