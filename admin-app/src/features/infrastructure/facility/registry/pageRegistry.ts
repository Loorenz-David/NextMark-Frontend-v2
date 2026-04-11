import type { StackComponentProps } from '@/shared/stack-manager/types'

import { FacilityMainPage } from '../pages/FacilityMainPage'

export type FacilityPageKey = keyof typeof pageRegistry

type ExtractPayload<T> =
  T extends React.ComponentType<StackComponentProps<infer P>>
    ? P
    : never

export type FacilitySectionPayloads = {
  [K in keyof typeof pageRegistry]: ExtractPayload<(typeof pageRegistry)[K]>
}

export const pageRegistry = {
  'facility.main': FacilityMainPage,
}
