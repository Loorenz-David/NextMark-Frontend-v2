import { useCallback } from 'react'

import { useMessageHandler } from '@shared-message-handler'
import { getObjectDiff } from '@shared-utils'
import { hasFormChanges } from '@shared-domain'

import { useTeamInvitationController } from '../../hooks/useTeamInvitationController'
import type { InviteMemberFormState } from './InviteMember.types'

export const useInviteMemberSubmit = ({
  formState,
  validateForm,
  initialFormRef,
}: {
  formState: InviteMemberFormState
  validateForm: () => boolean
  initialFormRef: React.RefObject<InviteMemberFormState | null>
}) => {
  const { showMessage } = useMessageHandler()
  const { sendInvitation } = useTeamInvitationController()

  const handleSave = useCallback(async () => {
    const isValid = validateForm()
    if (!isValid) {
      showMessage({ status: 400, message: 'Please fix the highlighted fields.' })
      return
    }

    if (!hasFormChanges(formState, initialFormRef)) {
      showMessage({ status: 400, message: 'No changes to save.' })
      return
    }

    const initialForm = initialFormRef.current
    if (!initialForm) {
      showMessage({ status: 400, message: 'Missing initial form snapshot.' })
      return
    }

    const formChanges = getObjectDiff(initialForm, formState)
    const roleId = Number(formChanges.user_role_id ?? formState.user_role_id)

    if (Number.isNaN(roleId)) {
      showMessage({ status: 400, message: 'Role id must be a number.' })
      return
    }

    await sendInvitation({
      client_id: '',
      user_role_id: roleId,
      user_role_name: formChanges.user_role_name ?? formState.user_role_name,
      target_user: {
        username: formChanges.target_username ?? formState.target_username,
        email: formChanges.target_email ?? formState.target_email,
      },
    })
  }, [formState, initialFormRef, sendInvitation, showMessage, validateForm])

  return { handleSave }
}
