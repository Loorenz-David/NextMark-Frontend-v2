import { validateEmail, validateString } from '@shared-domain'

import type { CostumerFormState, CostumerFormWarnings } from './CostumerForm.types'
import { validateOperatingHours } from '../flows/costumerOperatingHours.flow'

export const validateCostumerFormShape = ({
  first_name,
  last_name,
  email,
  operating_hours,
}: Pick<CostumerFormState, 'first_name' | 'last_name' | 'email' | 'operating_hours'>) => {
  const firstNameValid = validateString(first_name)
  const lastNameValid = validateString(last_name)

  const trimmedEmail = email.trim()
  const emailValid = validateString(trimmedEmail) && validateEmail(trimmedEmail)
  const operatingHoursValid = validateOperatingHours(operating_hours).valid

  return firstNameValid && lastNameValid && emailValid && operatingHoursValid
}

export const useCostumerFormValidation = ({
  formState,
  warnings,
}: {
  formState: CostumerFormState
  warnings: CostumerFormWarnings
}) => {
  const validateForm = () => {
    const firstNameValid = warnings.firstNameWarning.validate(formState.first_name)
    const lastNameValid = warnings.lastNameWarning.validate(formState.last_name)
    const emailValid = warnings.emailWarning.validate(formState.email)
    const operatingHoursValid = warnings.operatingHoursWarning.validate(formState.operating_hours)

    return firstNameValid && lastNameValid && emailValid && operatingHoursValid
  }

  return {
    validateForm,
  }
}
