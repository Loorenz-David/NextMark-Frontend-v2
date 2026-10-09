import type { ClientFormRedirectFormState } from './ClientFormRedirectForm.types'
import type { ClientFormRedirectFormWarnings } from './ClientFormRedirectForm.warnings'

export const useClientFormRedirectFormValidation = ({
  formState,
  warnings,
}: {
  formState: ClientFormRedirectFormState
  warnings: ClientFormRedirectFormWarnings
}) => {
  const validateForm = () => {
    // Both run so every invalid field is highlighted at once.
    const isLabelValid = warnings.labelWarning.validate(formState.label)
    const isUrlValid = warnings.urlWarning.validate(formState.url)
    return isLabelValid && isUrlValid
  }

  return { validateForm }
}
