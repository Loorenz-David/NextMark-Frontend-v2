import type { ChangeEvent, Dispatch, SetStateAction } from 'react'
import type { Phone } from '@/types/phone'
import type { UserEditFormState, UserEditWarnings } from './UserEdit.types'

export const useUserEditSetters = ({
  setFormState,
  warnings,
}: {
  setFormState: Dispatch<SetStateAction<UserEditFormState>>
  warnings: UserEditWarnings
}) => {
  const handleUsername = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setFormState((prev) => ({ ...prev, username: value }))
    warnings.usernameWarning.validate(value)
  }

  const handleEmail = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setFormState((prev) => ({ ...prev, email: value }))
    warnings.emailWarning.validate(value)
  }

  const handlePhone = (value: Phone) => {
    setFormState((prev) => ({ ...prev, phone_number: value }))
  }

  const handlePassword = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setFormState((prev) => {
      warnings.passwordConfirmationWarning.validate({
        password: value,
        confirmation: prev.password_confirmation,
      })
      return { ...prev, password: value }
    })
    warnings.passwordWarning.validate(value)
  }

  const handlePasswordConfirmation = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setFormState((prev) => {
      warnings.passwordConfirmationWarning.validate({
        password: prev.password,
        confirmation: value,
      })
      return { ...prev, password_confirmation: value }
    })
  }

  return {
    handleUsername,
    handleEmail,
    handlePhone,
    handlePassword,
    handlePasswordConfirmation,
  }
}
