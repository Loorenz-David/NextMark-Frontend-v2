import { useInputWarning } from '@/shared/inputs/useInputWarning.hook'
import { validateString } from '@shared-domain'

export type ItemPropertyFormWarnings = ReturnType<typeof useItemPropertyFormWarnings>

export const useItemPropertyFormWarnings = () => ({
  nameWarning: useInputWarning('Name is required.', (value) => validateString(String(value ?? ''))),
})
