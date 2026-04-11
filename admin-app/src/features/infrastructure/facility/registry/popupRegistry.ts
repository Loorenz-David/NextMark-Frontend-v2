import type { StackComponentProps } from '@/shared/stack-manager/types'

import { FacilityForm } from '../popups/FacilityForm/FacilityForm'

export type FacilityPopupKey = keyof typeof popupRegistry

type ExtractPayload<T> =
  T extends React.ComponentType<StackComponentProps<infer P>>
    ? P
    : never

export type FacilityPopupPayloads = {
  [K in keyof typeof popupRegistry]: ExtractPayload<(typeof popupRegistry)[K]>
}

export const popupRegistry = {
  'facility.form': FacilityForm,
}
