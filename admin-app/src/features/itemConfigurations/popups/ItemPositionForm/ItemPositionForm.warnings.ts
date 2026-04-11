import { useInputWarning } from '@/shared/inputs/useInputWarning.hook'
import { validateString } from '@shared-domain'

export type ItemPositionFormWarnings = ReturnType<typeof useItemPositionFormWarnings>

export const useItemPositionFormWarnings = () => ({
  nameWarning: useInputWarning('Name is required.', (value) => validateString(String(value ?? ''))),
})
