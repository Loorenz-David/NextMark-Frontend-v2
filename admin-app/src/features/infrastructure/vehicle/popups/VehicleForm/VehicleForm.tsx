import type { StackComponentProps } from '@/shared/stack-manager/types'

import { VehicleFormFeature } from '../../forms/vehicleForm/VehicleForm'
import { VehicleFormProvider } from './VehicleForm.provider'
import type { VehicleFormPayload } from './VehicleForm.types'

export const VehicleForm = ({ payload }: StackComponentProps<VehicleFormPayload>) => (
  <VehicleFormProvider payload={payload ?? { mode: 'create' }}>
    <VehicleFormFeature />
  </VehicleFormProvider>
)
