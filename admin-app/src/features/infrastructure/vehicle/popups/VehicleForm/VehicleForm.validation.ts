import type { VehicleFormState } from './VehicleForm.types'
import type { VehicleFormWarnings } from './VehicleForm.warnings'

export const useVehicleFormValidation = ({
  formState,
  warnings,
}: {
  formState: VehicleFormState
  warnings: VehicleFormWarnings
}) => {
  const validateForm = () => warnings.registrationNumberWarning.validate(formState.registration_number)

  return { validateForm }
}
