import type { StackComponentProps } from '@/shared/stack-manager/types'

import { VehicleForm } from '../popups/VehicleForm/VehicleForm'

export type VehiclePopupKey = keyof typeof popupRegistry

type ExtractPayload<T> =
  T extends React.ComponentType<StackComponentProps<infer P>>
    ? P
    : never

export type VehiclePopupPayloads = {
  [K in keyof typeof popupRegistry]: ExtractPayload<(typeof popupRegistry)[K]>
}

export const popupRegistry = {
  'vehicle.form': VehicleForm,
}
