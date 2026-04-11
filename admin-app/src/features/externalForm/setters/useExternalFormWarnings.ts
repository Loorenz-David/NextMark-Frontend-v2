import { useInputWarning } from '@/shared/inputs/useInputWarning.hook'

import {
  validateContactInfo,
  validateDeliveryAddress,
} from '../domain/externalForm.validation'
import type { ExternalFormData } from '../domain/externalForm.types'

export const useExternalFormWarnings = () => {
  const firstNameWarning = useInputWarning('First name is required.', (value, setMessage) => {
    const isValid = Boolean(value)
    if (!isValid) {
      setMessage('First name is required.')
    }
    return isValid
  })

  const lastNameWarning = useInputWarning('Last name is required.', (value, setMessage) => {
    const isValid = Boolean(value)
    if (!isValid) {
      setMessage('Last name is required.')
    }
    return isValid
  })

  const contactWarning = useInputWarning('Phone and email are required.', (value, setMessage) => {
    const data = value as ExternalFormData
    const isValid = validateContactInfo(data)
    if (!isValid) {
      setMessage('Phone and email are required.')
    }
    return isValid
  })

  const addressWarning = useInputWarning('Address is required.', (value, setMessage) => {
    const data = value as ExternalFormData
    const isValid = validateDeliveryAddress(data)
    if (!isValid) {
      setMessage('Address is required.')
    }
    return isValid
  })

  return {
    firstNameWarning,
    lastNameWarning,
    contactWarning,
    addressWarning,
  }
}
