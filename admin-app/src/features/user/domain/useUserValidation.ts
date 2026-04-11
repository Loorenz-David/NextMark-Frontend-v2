import { validateEmail, validateString } from '@shared-domain'

export const useUserValidation = () => {
  const validateUsername = (value: string) => validateString(value)

  const validateUserEmail = (value: string) => validateEmail(value)

  const validatePassword = (value: string) => isStrongPassword(value)

  const validatePasswordConfirmation = (password: string, confirmation: string) =>
    Boolean(password) && password === confirmation

  return {
    validateUsername,
    validateUserEmail,
    validatePassword,
    validatePasswordConfirmation,
  }
}

const isStrongPassword = (value: string) => {
  if (!validateString(value)) return false
  if (value.length < 8) return false
  const hasUpper = /[A-Z]/.test(value)
  const hasLower = /[a-z]/.test(value)
  const hasNumber = /\d/.test(value)
  return hasUpper && hasLower && hasNumber
}
