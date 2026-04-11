import { validateString } from '@shared-domain'
import { validateAddress } from '@/shared/data-validation/addressValidation'
import type { address } from '@/types/address'

export const useFacilityValidation = () => ({
  validateName: (value: string) => validateString(value),
  validateLocation: (value: Record<string, unknown> | null | undefined) =>
    value ? validateAddress(value as address) : true,
})
