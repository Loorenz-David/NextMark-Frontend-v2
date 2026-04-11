import { useCallback } from 'react'

import { useMessageHandler } from '@shared-message-handler'
import { usePopupManager } from '@/shared/resource-manager/useResourceManager'

import { useUpdateUser } from '../api/user.api'
import { useUserValidation } from '../domain/useUserValidation'
import { updateUserByClientId } from '../store/user.store'
import type { UserUpdateFields } from '../types/user'

export type UpdateProfileParams = {
  clientId: string
  serverId?: number | null
  fields: UserUpdateFields
  passwordConfirmation?: string
}

export const useUserController = () => {
  const updateUser = useUpdateUser()
  const { showMessage } = useMessageHandler()
  const popupManager = usePopupManager()
  const validation = useUserValidation()

  const saveProfile = useCallback(
    async ({ clientId, serverId, fields, passwordConfirmation }: UpdateProfileParams) => {
      const isUsernameValid = fields.username ? validation.validateUsername(fields.username) : true
      const isEmailValid = fields.email ? validation.validateUserEmail(fields.email) : true
      const isPasswordValid = fields.password ? validation.validatePassword(fields.password) : true
      const isPasswordMatch = fields.password
        ? validation.validatePasswordConfirmation(fields.password, passwordConfirmation ?? '')
        : true

      if (!isUsernameValid || !isEmailValid || !isPasswordValid || !isPasswordMatch) {
        showMessage({ status: 400, message: 'Please check the form inputs.' })
        return false
      }

      try {
        await updateUser({
          target_id: serverId ?? clientId,
          fields,
        })

        updateUserByClientId(clientId, (user) => ({ ...user, ...fields }))
        popupManager.closeByKey('user.edit')
        return true
      } catch (error) {
        console.error('Failed to update user profile', error)
        showMessage({ status: 500, message: 'Unable to update profile.' })
        return false
      }
    },
    [popupManager, showMessage, updateUser, validation],
  )

  return { saveProfile }
}
