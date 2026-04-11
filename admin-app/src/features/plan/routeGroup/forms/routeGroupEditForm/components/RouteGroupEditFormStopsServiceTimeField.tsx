import { Field } from '@/shared/inputs/FieldContainer'
import { CustomNumberPicker } from '@/shared/inputs/CustomTimePicker'

import { useRouteGroupEditForm } from '../RouteGroupEditForm.context'
import {
  LOCAL_DELIVERY_ORDER_SERVICE_TIME_INFO,
  LOCAL_DELIVERY_PER_ITEM_SERVICE_TIME_INFO,
} from '../info/serviceTime.info'

const SERVICE_TIME_MIN = 0
const SERVICE_TIME_MAX = 120

export const RouteGroupEditFormStopsServiceTimeField = () => {
  const { formState, formSetters } = useRouteGroupEditForm()
  const serviceTime = formState.route_solution.stops_service_time ?? {
    time: 0,
    per_item: 0,
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <Field
        label="Service Time Per Order:"
        info={LOCAL_DELIVERY_ORDER_SERVICE_TIME_INFO}
      >
        <CustomNumberPicker
          selectedValue={serviceTime.time}
          onChange={formSetters.handleStopsServiceTimeTime}
          min={SERVICE_TIME_MIN}
          max={SERVICE_TIME_MAX}
          label="Minutes"
        />
      </Field>

      <Field
        label="Service Time Per item :"
        info={LOCAL_DELIVERY_PER_ITEM_SERVICE_TIME_INFO}
      >
        <CustomNumberPicker
          selectedValue={serviceTime.per_item}
          onChange={formSetters.handleStopsServiceTimePerItem}
          min={SERVICE_TIME_MIN}
          max={SERVICE_TIME_MAX}
          label="Minutes"
        />
      </Field>
    </div>
  )
}
