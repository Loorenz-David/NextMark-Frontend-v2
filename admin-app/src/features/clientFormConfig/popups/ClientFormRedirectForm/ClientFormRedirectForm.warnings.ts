import { resolveClientFormRedirect } from '@client-form-kit'

import { useInputWarning } from '@/shared/inputs/useInputWarning.hook'
import { validateString } from '@shared-domain'

export const MAX_REDIRECT_LABEL_LENGTH = 80

export type ClientFormRedirectFormWarnings = ReturnType<typeof useClientFormRedirectFormWarnings>

export const useClientFormRedirectFormWarnings = () => ({
  labelWarning: useInputWarning(
    `A name of up to ${MAX_REDIRECT_LABEL_LENGTH} characters is required.`,
    (value) => {
      const label = String(value ?? '')
      return validateString(label) && label.trim().length <= MAX_REDIRECT_LABEL_LENGTH
    },
  ),
  // The same rule the public form applies before it navigates, so an address
  // accepted here is one a customer is actually sent to.
  urlWarning: useInputWarning(
    'Enter the full address of a public website, starting with https://',
    (value) => resolveClientFormRedirect(String(value ?? '')) !== null,
  ),
})
