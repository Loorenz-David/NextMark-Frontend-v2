import { Field } from '@/shared/inputs/FieldContainer'
import { InputWarning } from '@/shared/inputs/InputWarning'

import { VehicleSelector } from '@/features/infrastructure/vehicle/components/VehicleSelector/VehicleSelector'
import { useLocalDeliveryEditForm } from '../LocalDeliveryEditForm.context'

export const LocalDeliveryEditFormVehicleField = () => {
  const { formState, formSetters, formWarnings } = useLocalDeliveryEditForm()

  return (
    <Field label="Vehicle:">
      <VehicleSelector
        selectedVehicle={formState.route_solution.vehicle_id}
        onSelectVehicle={formSetters.handleVehicleSelection}
      />
      {formWarnings.vehicleBusyWarning.warning.isVisible && (
        <InputWarning {...formWarnings.vehicleBusyWarning.warning} />
      )}
    </Field>
  )
}
