import type { Dispatch, SetStateAction } from 'react'

import type { ClientFormRedirectFormState } from './ClientFormRedirectForm.types'
import type { ClientFormRedirectFormWarnings } from './ClientFormRedirectForm.warnings'

export const useClientFormRedirectFormSetters = ({
  setFormState,
  warnings,
}: {
  setFormState: Dispatch<SetStateAction<ClientFormRedirectFormState>>
  warnings: ClientFormRedirectFormWarnings
}) => {
  const handleLabel = (value: string) => {
    warnings.labelWarning.validate(value)
    setFormState((prev) => ({ ...prev, label: value }))
  }

  const handleUrl = (value: string) => {
    // Only cleared while typing; a half-typed address is not an error yet.
    if (warnings.urlWarning.warning.isVisible) {
      warnings.urlWarning.validate(value)
    }
    setFormState((prev) => ({ ...prev, url: value }))
  }

  const handleUrlBlur = (value: string) => warnings.urlWarning.validate(value)

  return { handleLabel, handleUrl, handleUrlBlur }
}
