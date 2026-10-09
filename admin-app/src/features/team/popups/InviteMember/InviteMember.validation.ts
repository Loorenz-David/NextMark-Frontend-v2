import type { InviteMemberFormState } from './InviteMember.types'
import type { InviteMemberWarnings } from './InviteMember.warnings'

export const useInviteMemberValidation = ({
  formState,
  warnings,
}: {
  formState: InviteMemberFormState
  warnings: InviteMemberWarnings
}) => {
  const validateForm = () => {
    const emailOk = warnings.emailWarning.validate(formState.target_email)
    const roleOk = warnings.roleWarning.validate(formState.user_role_id)

    return emailOk && roleOk
  }

  return { validateForm }
}
