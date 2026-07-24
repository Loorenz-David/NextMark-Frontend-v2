import { useInputWarning } from '@/shared/inputs/useInputWarning.hook'
import { validateString } from '@shared-domain'

export type ClientFormMediaFormWarnings = ReturnType<typeof useClientFormMediaFormWarnings>

export const useClientFormMediaFormWarnings = () => ({
  urlWarning: useInputWarning('Image URL is required.', (value) =>
    validateString(String(value ?? '')),
  ),
})
