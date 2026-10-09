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

  const roleWarning = useInputWarning('Select a role.', (value, setMessage) => {
    const isValid = validation.validateRoleId(String(value ?? ''))
    if (!isValid) {
      setMessage('Select a role.')
    }
    return isValid
  })

  return {

    emailWarning,
    roleWarning,
  }
}
