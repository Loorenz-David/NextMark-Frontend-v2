import type { StackComponentProps } from '@/shared/stack-manager/types'

import { VehicleMainPage } from '../pages/VehicleMainPage'

export type VehiclePageKey = keyof typeof pageRegistry

type ExtractPayload<T> =
  T extends React.ComponentType<StackComponentProps<infer P>>
    ? P
    : never

export type VehicleSectionPayloads = {
  [K in keyof typeof pageRegistry]: ExtractPayload<(typeof pageRegistry)[K]>
}

export const pageRegistry = {
  'vehicle.main': VehicleMainPage,
}
