import { useInputWarning } from '@/shared/inputs/useInputWarning.hook'

import { useVehicleValidation } from '../../domain/useVehicleValidation'

export type VehicleFormWarnings = ReturnType<typeof useVehicleFormWarnings>

export const useVehicleFormWarnings = () => {
  const validation = useVehicleValidation()

  const registrationNumberWarning = useInputWarning('Registration number is required.', (value, setMessage) => {
    const isValid = validation.validateRegistrationNumber(String(value ?? ''))
    if (!isValid) {
      setMessage('Registration number is required.')
    }
    return isValid
  })

  return { registrationNumberWarning }
}
