import type { Dispatch, SetStateAction } from 'react'

import type { MediaPlacement } from '../../domain/mediaPlacement'
import type { ClientFormMediaFormState } from './ClientFormMediaForm.types'
import type { ClientFormMediaFormWarnings } from './ClientFormMediaForm.warnings'

export const useClientFormMediaFormSetters = ({
  setFormState,
  warnings,
}: {
  setFormState: Dispatch<SetStateAction<ClientFormMediaFormState>>
  warnings: ClientFormMediaFormWarnings
}) => {
  const handlePlacement = (value: MediaPlacement) =>
    setFormState((prev) => ({ ...prev, placement: value }))

  const handleUrl = (value: string) => {
    warnings.urlWarning.validate(value)
    setFormState((prev) => ({ ...prev, url: value }))
  }

  const handleAltText = (value: string) => setFormState((prev) => ({ ...prev, alt_text: value }))

  const handleLinkUrl = (value: string) => setFormState((prev) => ({ ...prev, link_url: value }))

  const handleTitle = (value: string) => setFormState((prev) => ({ ...prev, title: value }))

  const handleDescription = (value: string) =>
    setFormState((prev) => ({ ...prev, description: value }))

  const handleEnabled = (value: boolean) => setFormState((prev) => ({ ...prev, enabled: value }))

  return {
    handlePlacement,
    handleUrl,
    handleAltText,
    handleLinkUrl,
    handleTitle,
    handleDescription,
    handleEnabled,
  }
}
