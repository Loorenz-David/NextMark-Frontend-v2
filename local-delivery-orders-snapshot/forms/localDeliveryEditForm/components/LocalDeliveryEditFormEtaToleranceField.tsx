import { Field } from '@/shared/inputs/FieldContainer'
import { CustomNumberPicker } from '@/shared/inputs/CustomTimePicker'

import { useLocalDeliveryEditForm } from '../LocalDeliveryEditForm.context'
import { LOCAL_DELIVERY_ETA_TOLERANCE_INFO } from '../info/etaTolerance.info'

const ETA_TOLERANCE_MIN = 0
const ETA_TOLERANCE_MAX = 120

export const LocalDeliveryEditFormEtaToleranceField = () => {
  const { formState, formSetters } = useLocalDeliveryEditForm()

  return (
    <Field
      label="ETA Arrival Tolerance:"
      info={LOCAL_DELIVERY_ETA_TOLERANCE_INFO}
    >
      <CustomNumberPicker
        selectedValue={formState.route_solution.eta_tolerance_minutes}
        onChange={formSetters.handleEtaToleranceMinutes}
        min={ETA_TOLERANCE_MIN}
        max={ETA_TOLERANCE_MAX}
        label="Minutes"
      />
    </Field>
  )
}
