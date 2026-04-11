import type { RefObject } from 'react'

import { hasFormChanges } from '@shared-domain'
import { isDateOnOrAfterToday } from '@/shared/data-validation/timeValidation'

import type { LocalDeliveryEditFormState } from './LocalDeliveryEditForm.types'
import type { LocalDeliveryEditFormWarnings } from './LocalDeliveryEditForm.types'

type Props = {
  formWarnings: LocalDeliveryEditFormWarnings
  formState: LocalDeliveryEditFormState
  initialFormRef: RefObject<LocalDeliveryEditFormState | null>
}

export const useLocalDeliveryEditFormValidation = ({
  formWarnings,
  formState,
  initialFormRef,
}: Props) => {
  const validateForm = () => {
    const isVehicleBusy = formWarnings.vehicleBusyWarning.hasWarningActive()
    const valid = [
      formWarnings.planDateWarning.validate({
        start_date: formState.delivery_plan.start_date,
        end_date: formState.delivery_plan.end_date,
      }),
      isDateOnOrAfterToday(formState.delivery_plan.start_date),
      isDateOnOrAfterToday(formState.delivery_plan.end_date),
      formWarnings.routeStartTimeWarning.validate({
        start_date: formState.delivery_plan.start_date,
        start_time: formState.route_solution.set_start_time,
      }),
      formWarnings.routeEndTimeWarning.validate({
        start_date: formState.delivery_plan.start_date,
        end_date: formState.delivery_plan.end_date,
        start_time: formState.route_solution.set_start_time,
        end_time: formState.route_solution.set_end_time,
      }),
      !isVehicleBusy,
    ]
   
    return valid.every((entry) => entry === true)
  }

  const allowClose = () => !hasFormChanges(formState, initialFormRef)

  return {
    validateForm,
    hasChanges: allowClose,
  }
}
