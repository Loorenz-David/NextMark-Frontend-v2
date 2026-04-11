import { Field } from '@/shared/inputs/FieldContainer'
import { CustomNumberPicker } from '@/shared/inputs/CustomTimePicker'

import { useRouteGroupEditForm } from '../RouteGroupEditForm.context'
import { LOCAL_DELIVERY_ETA_MESSAGE_TOLERANCE_INFO } from '../info/etaMessageTolerance.info'

const ETA_MESSAGE_TOLERANCE_MIN = 0
const ETA_MESSAGE_TOLERANCE_MAX = 120

export const RouteGroupEditFormEtaMessageToleranceField = () => {
  const { formState, formSetters } = useRouteGroupEditForm()

  return (
    <Field
      label="ETA Message Tolerance:"
      info={LOCAL_DELIVERY_ETA_MESSAGE_TOLERANCE_INFO}
    >
      <CustomNumberPicker
        selectedValue={formState.route_solution.eta_message_tolerance_minutes}
        onChange={formSetters.handleEtaMessageToleranceMinutes}
        min={ETA_MESSAGE_TOLERANCE_MIN}
        max={ETA_MESSAGE_TOLERANCE_MAX}
        label="Minutes"
      />
    </Field>
  )
}
