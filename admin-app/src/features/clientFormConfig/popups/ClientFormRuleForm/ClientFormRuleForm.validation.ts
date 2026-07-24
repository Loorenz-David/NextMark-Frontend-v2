import type { ClientFormRuleFormState } from './ClientFormRuleForm.types'
import type { ClientFormRuleFormWarnings } from './ClientFormRuleForm.warnings'

export const useClientFormRuleFormValidation = ({
  formState,
  warnings,
}: {
  formState: ClientFormRuleFormState
  warnings: ClientFormRuleFormWarnings
}) => {
  const validateForm = () => warnings.titleWarning.validate(formState.title)

  return { validateForm }
}
