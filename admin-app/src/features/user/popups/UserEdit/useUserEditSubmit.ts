import type { RefObject } from 'react'
import { useCallback } from 'react'

import { useMessageHandler } from '@shared-message-handler'
import { getObjectDiff } from '@shared-utils'
import { hasFormChanges } from '@shared-domain'

import { useUserController } from '../../hooks/useUserController'
import type { User, UserUpdateFields } from '../../types/user'
import type { UserEditFormState } from './UserEdit.types'

export const useUserEditSubmit = ({
  user,
  formState,
  validateForm,
  initialFormRef,
}: {
  user: User | null
  formState: UserEditFormState
  validateForm: () => boolean
  initialFormRef: RefObject<UserEditFormState | null>
}) => {
  const { showMessage } = useMessageHandler()
  const { saveProfile } = useUserController()

  const handleSave = useCallback(async () => {
    const isValid = validateForm()
    if (!isValid) {
      showMessage({ status: 400, message: 'Please fix the highlighted fields.' })
      return
    }

    if (!user) {
      showMessage({ status: 400, message: 'User profile is missing.' })
      return
    }

    const initialForm = initialFormRef.current
    if (!initialForm) {
      showMessage({ status: 400, message: 'Missing initial form snapshot.' })
      return
    }

    if (!hasFormChanges(formState, initialFormRef)) {
      showMessage({ status: 400, message: 'No changes to save.' })
      return
    }

    const formChanges = getObjectDiff(initialForm, formState)

    const fields: UserUpdateFields = {}

    if ('username' in formChanges) fields.username = formChanges.username
    if ('email' in formChanges) fields.email = formChanges.email
    if ('phone_number' in formChanges) fields.phone_number = formChanges.phone_number
    if ('password' in formChanges) fields.password = formChanges.password

    await saveProfile({
      clientId: user.client_id,
      serverId: user.id,
      fields,
      passwordConfirmation: 'password' in formChanges ? formState.password_confirmation : undefined,
    })
  }, [formState, initialFormRef, saveProfile, showMessage, user, validateForm])

  return {
    handleSave,
  }
}
