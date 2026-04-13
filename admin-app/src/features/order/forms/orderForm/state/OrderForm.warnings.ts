import { useInputWarning } from '@/shared/inputs/useInputWarning.hook'
import { validateAddress } from '@/shared/data-validation/addressValidation'
import { validateString } from '@shared-domain'
import type { address } from '@/types/address'
import type { Phone } from '@/types/phone'
import type { OrderDeliveryWindow } from '../../../types/order'

import { useOrderValidation } from '../../../domain/useOrderValidation'
import { validateNonOverlappingUtcDeliveryWindows } from '../flows/orderFormDeliveryWindows.flow'

export const useOrderFormWarnings = () => {
  const validation = useOrderValidation()


  const referenceWarning = useInputWarning('Reference is required.', (value, setMessage) => {
    const isValid = validation.validateReferenceNumber(String(value ?? ''))
    if (!isValid) {
      setMessage('Reference is required.')
    }
    return isValid
  })

  const firstNameWarning = useInputWarning('First name is required.', (value, setMessage) => {
    const isValid = validation.validateCustomerName(String(value ?? ''))
    if (!isValid) {
      setMessage('First name is required.')
    }
    return isValid
  })

  const lastNameWarning = useInputWarning('Last name is required.', (value, setMessage) => {
    const isValid = validation.validateCustomerName(String(value ?? ''))
    if (!isValid) {
      setMessage('Last name is required.')
    }
    return isValid
  })

  const emailWarning = useInputWarning('Valid email is required.', (value, setMessage) => {
    const emailValue = String(value ?? '').trim()
    const isValid = validateString(emailValue) && validation.validateCustomerEmail(emailValue)
    if (!isValid) {
      setMessage('Valid email is required.')
    }
    return isValid
  })

  const primaryPhoneWarning = useInputWarning('Primary phone is required.', (value, setMessage) => {
    const phone = value as Phone | null | undefined
    const isValid = validation.validatePhone(phone, { required: true })
    if (!isValid) {
      setMessage('Primary phone is required.')
    }
    return isValid
  })

  const addressWarning = useInputWarning('Address is required.', (value, setMessage) => {
    const candidate = value as address | null | undefined
    const isValid = validateAddress(candidate ?? null)
    if (!isValid) {
      setMessage('Address is required.')
    }
    return isValid
  })

  const deliveryWindowsWarning = useInputWarning(undefined, (value, setMessage) => {
    const candidate = value as OrderDeliveryWindow[] | null | undefined

    if (!Array.isArray(candidate) || candidate.length === 0) {
      return true
    }

    const overlapValidation = validateNonOverlappingUtcDeliveryWindows(candidate)
    if (!overlapValidation.valid) {
      setMessage(overlapValidation.message)
      return false
    }

    return true
  })

  return {
    referenceWarning,
    firstNameWarning,
    lastNameWarning,
    emailWarning,
    primaryPhoneWarning,
    addressWarning,
    deliveryWindowsWarning,
  }
}

