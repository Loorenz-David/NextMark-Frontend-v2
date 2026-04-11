import { useInputWarning } from '@/shared/inputs/useInputWarning.hook'
import { validateEmail, validateString } from '@shared-domain'
import type { CostumerOperatingHours } from '../../../dto/costumer.dto'
import { validateOperatingHours } from '../flows/costumerOperatingHours.flow'

export const useCostumerFormWarnings = () => {
  const firstNameWarning = useInputWarning('First name is required.', (value, setMessage) => {
    const isValid = validateString(String(value ?? ''))
    if (!isValid) {
      setMessage('First name is required.')
    }
    return isValid
  })

  const lastNameWarning = useInputWarning('Last name is required.', (value, setMessage) => {
    const isValid = validateString(String(value ?? ''))
    if (!isValid) {
      setMessage('Last name is required.')
    }
    return isValid
  })

  const emailWarning = useInputWarning('Email is required.', (value, setMessage) => {
    const candidate = String(value ?? '').trim()
    if (!validateString(candidate)) {
      setMessage('Email is required.')
      return false
    }

    const isValid = validateEmail(candidate)
    if (!isValid) {
      setMessage('Invalid email.')
    }

    return isValid
  })

  const operatingHoursWarning = useInputWarning('Invalid operating hours.', (value, setMessage) => {
    const hours = Array.isArray(value) ? (value as CostumerOperatingHours[]) : []
    const result = validateOperatingHours(hours)
    if (!result.valid) {
      setMessage(result.message ?? 'Invalid operating hours.')
    }
    return result.valid
  })

  return {
    firstNameWarning,
    lastNameWarning,
    emailWarning,
    operatingHoursWarning,
  }
}
