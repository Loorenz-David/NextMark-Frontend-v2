import type { Dispatch, SetStateAction } from 'react'

import type { InviteMemberFormState } from './InviteMember.types'
import type { InviteMemberWarnings } from './InviteMember.warnings'

export const useInviteMemberSetters = ({
  setFormState,
  warnings,
}: {
  setFormState: Dispatch<SetStateAction<InviteMemberFormState>>
  warnings: InviteMemberWarnings
}) => {
  const handleUsername = (value: string) => {
    warnings.roleNameWarning.validate(value)
    setFormState((prev) => ({ ...prev, target_username: value }))
  }

  const handleEmail = (value: string) => {
    warnings.emailWarning.validate(value)
    setFormState((prev) => ({ ...prev, target_email: value }))
  }

  const handleRoleName = (value: string) => {
    warnings.roleNameWarning.validate(value)
    setFormState((prev) => ({ ...prev, user_role_name: value }))
  }

  const handleRoleId = (value: string) => {
    warnings.roleIdWarning.validate(value)
    setFormState((prev) => ({ ...prev, user_role_id: value }))
  }

  return {
    handleUsername,
    handleEmail,
    handleRoleName,
    handleRoleId,
  }
}
