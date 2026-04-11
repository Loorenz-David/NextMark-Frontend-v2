import type { StackComponentProps } from '@/shared/stack-manager/types'

import { FacilityFormFeature } from '../../forms/facilityForm/FacilityForm'
import { FacilityFormProvider } from './FacilityForm.provider'
import type { FacilityFormPayload } from './FacilityForm.types'

export const FacilityForm = ({ payload }: StackComponentProps<FacilityFormPayload>) => (
  <FacilityFormProvider payload={payload ?? { mode: 'create' }}>
    <FacilityFormFeature />
  </FacilityFormProvider>
)
