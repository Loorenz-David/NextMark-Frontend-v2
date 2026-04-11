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
    const roleNameOk = warnings.roleNameWarning.validate(formState.user_role_name)
    const roleIdOk = warnings.roleIdWarning.validate(formState.user_role_id)

    return  emailOk && roleNameOk && roleIdOk
  }

  return { validateForm }
}
