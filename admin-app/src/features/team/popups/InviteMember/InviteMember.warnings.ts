import { useInputWarning } from '@/shared/inputs/useInputWarning.hook'

import { useTeamInvitationValidation } from '../../domain/useTeamInvitationValidation'

export type InviteMemberWarnings = ReturnType<typeof useInviteMemberWarnings>

export const useInviteMemberWarnings = () => {
  const validation = useTeamInvitationValidation()



  const emailWarning = useInputWarning('Provide a valid email address.', (value, setMessage) => {
    const isValid = validation.validateEmail(String(value ?? ''))
    if (!isValid) {
      setMessage('Provide a valid email address.')
    }
    return isValid
  })

  const roleNameWarning = useInputWarning('Role name is required.', (value, setMessage) => {
    const isValid = validation.validateRoleName(String(value ?? ''))
    if (!isValid) {
      setMessage('Role name is required.')
    }
    return isValid
  })

  const roleIdWarning = useInputWarning('Role id must be a number.', (value, setMessage) => {
    const isValid = validation.validateRoleId(String(value ?? ''))
    if (!isValid) {
      setMessage('Role id must be a number.')
    }
    return isValid
  })

  return {

    emailWarning,
    roleNameWarning,
    roleIdWarning,
  }
}
