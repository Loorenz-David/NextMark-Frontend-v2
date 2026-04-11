import { useInputWarning } from '@/shared/inputs/useInputWarning.hook'

import type { address } from '@/types/address'

import { facilityTypeValueSet } from '../../../domain/infrastructureEnums'
import { useFacilityValidation } from '../../domain/useFacilityValidation'

export type FacilityFormWarnings = ReturnType<typeof useFacilityFormWarnings>

export const useFacilityFormWarnings = () => {
  const validation = useFacilityValidation()

  const nameWarning = useInputWarning('Name is required.', (value, setMessage) => {
    const isValid = validation.validateName(String(value ?? ''))
    if (!isValid) {
      setMessage('Name is required.')
    }
    return isValid
  })

  const facilityTypeWarning = useInputWarning('Facility type is required.', (value, setMessage) => {
    const stringValue = String(value ?? '').trim()
    const isValid = facilityTypeValueSet.has(stringValue as never)
    if (!isValid) {
      setMessage('Facility type must match the backend enum values.')
    }
    return isValid
  })

  const locationWarning = useInputWarning('Please provide a valid address.', (value, setMessage) => {
    const isValid = validation.validateLocation(value as address | null)
    if (!isValid) {
      setMessage('Please provide a valid address.')
    }
    return isValid
  })

  return {
    nameWarning,
    facilityTypeWarning,
    locationWarning,
  }
}
