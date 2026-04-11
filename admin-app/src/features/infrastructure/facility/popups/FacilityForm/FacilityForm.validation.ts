import type { FacilityFormState } from './FacilityForm.types'
import type { FacilityFormWarnings } from './FacilityForm.warnings'

export const useFacilityFormValidation = ({
  formState,
  warnings,
}: {
  formState: FacilityFormState
  warnings: FacilityFormWarnings
}) => {
  const validateForm = () => {
    const nameValid = warnings.nameWarning.validate(formState.name)
    const facilityTypeValid = warnings.facilityTypeWarning.validate(formState.facility_type)
    const locationValid = warnings.locationWarning.validate(formState.property_location)
    return nameValid && facilityTypeValid && locationValid
  }

  return { validateForm }
}
