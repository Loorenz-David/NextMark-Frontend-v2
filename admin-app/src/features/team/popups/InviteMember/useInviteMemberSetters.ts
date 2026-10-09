import type { Dispatch, SetStateAction } from 'react'

import type { UserRole } from '@/features/role/userRole/types/userRole'

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
    setFormState((prev) => ({ ...prev, target_username: value }))
  }

  const handleEmail = (value: string) => {
    warnings.emailWarning.validate(value)
    setFormState((prev) => ({ ...prev, target_email: value }))
  }

  const handleRole = (role: UserRole | null) => {
    const roleId = role?.id != null ? String(role.id) : ''
    warnings.roleWarning.validate(roleId)
    setFormState((prev) => ({
      ...prev,
      user_role_id: roleId,
      user_role_name: role?.role_name ?? '',
    }))
  }

  return {
    handleUsername,
    handleEmail,
    handleRole,
  }
}
