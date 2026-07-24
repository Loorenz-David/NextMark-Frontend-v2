import type { Dispatch, SetStateAction } from 'react'

import type { ClientFormRuleFormState } from './ClientFormRuleForm.types'
import type { ClientFormRuleFormWarnings } from './ClientFormRuleForm.warnings'

export const useClientFormRuleFormSetters = ({
  setFormState,
  warnings,
}: {
  setFormState: Dispatch<SetStateAction<ClientFormRuleFormState>>
  warnings: ClientFormRuleFormWarnings
}) => {
  const handleTitle = (value: string) => {
    warnings.titleWarning.validate(value)
    setFormState((prev) => ({ ...prev, title: value }))
  }

  const handleBody = (value: string) => setFormState((prev) => ({ ...prev, body: value }))

  const handleIcon = (value: string) => setFormState((prev) => ({ ...prev, icon: value }))

  const handleImageUrl = (value: string) =>
    setFormState((prev) => ({ ...prev, image_url: value }))

  const handleEnabled = (value: boolean) => setFormState((prev) => ({ ...prev, enabled: value }))

  return { handleTitle, handleBody, handleIcon, handleImageUrl, handleEnabled }
}
