import { validateString } from '@shared-domain'

export const useVehicleValidation = () => ({
  validateRegistrationNumber: (value: string) => validateString(value),
})
