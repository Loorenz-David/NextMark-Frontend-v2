import { useInputWarning } from '@/shared/inputs/useInputWarning.hook'

import { useUserValidation } from '../../domain/useUserValidation'

export const useUserEditWarnings = () => {
  const validation = useUserValidation()

  const usernameWarning = useInputWarning('Username is required.', (value, setMessage) => {
    const isValid = validation.validateUsername(String(value ?? ''))
    if (!isValid) {
      setMessage('Username is required.')
    }
    return isValid
  })

  const emailWarning = useInputWarning('Invalid email.', (value, setMessage) => {
    const isValid = validation.validateUserEmail(String(value ?? ''))
    if (!isValid) {
      setMessage('Invalid email.')
    }
    return isValid
  })

  const passwordWarning = useInputWarning('Password is required.', (value, setMessage) => {
    const isValid = validation.validatePassword(String(value ?? ''))
    if (!isValid) {
      setMessage('Password must be at least 8 characters and include upper, lower, and number.')
    }
    return isValid
  })

  const passwordConfirmationWarning = useInputWarning(
    'Passwords do not match.',
    (value, setMessage) => {
      const payload = value as { password: string; confirmation: string }
      const isValid = validation.validatePasswordConfirmation(
        String(payload.password ?? ''),
        String(payload.confirmation ?? ''),
      )
      if (!isValid) {
        setMessage('Passwords do not match.')
      }
      return isValid
    },
  )

  return {
    usernameWarning,
    emailWarning,
    passwordWarning,
    passwordConfirmationWarning,
  }
}
