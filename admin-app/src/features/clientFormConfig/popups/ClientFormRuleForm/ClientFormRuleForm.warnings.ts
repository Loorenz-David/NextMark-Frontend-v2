import { useInputWarning } from '@/shared/inputs/useInputWarning.hook'
import { validateString } from '@shared-domain'

export type ClientFormRuleFormWarnings = ReturnType<typeof useClientFormRuleFormWarnings>

export const useClientFormRuleFormWarnings = () => ({
  titleWarning: useInputWarning('Title is required.', (value) =>
    validateString(String(value ?? '')),
  ),
})
