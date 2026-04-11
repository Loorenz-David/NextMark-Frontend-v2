import type { StackComponentProps } from '@/shared/stack-manager/types'

import { CostumerForm } from '../popups/CostumerForm'

type ExtractPayload<T> = T extends React.ComponentType<StackComponentProps<infer P>>
  ? P
  : never

export const costumerPopupRegistry = {
  'costumer.form': CostumerForm,
}

export type CostumerPopupKey = keyof typeof costumerPopupRegistry

export type CostumerPopupPayloads = {
  [K in keyof typeof costumerPopupRegistry]: ExtractPayload<(typeof costumerPopupRegistry)[K]>
}
