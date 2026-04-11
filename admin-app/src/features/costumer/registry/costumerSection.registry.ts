import type { StackComponentProps } from '@/shared/stack-manager/types'

import { CostumerDetailPage } from '../pages/costumerDetail.page'

type ExtractPayload<T> = T extends React.ComponentType<StackComponentProps<infer P>>
  ? P
  : never

export const pageRegistry = {
  'costumer.details': CostumerDetailPage,
}

export type CostumerPageKey = keyof typeof pageRegistry

export type CostumerPagePayloads = {
  [K in keyof typeof pageRegistry]: ExtractPayload<(typeof pageRegistry)[K]>
}

