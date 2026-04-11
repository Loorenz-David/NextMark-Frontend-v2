import type { StackComponentProps } from '@/shared/stack-manager/types'

import { IntegrationConfig } from '../popups/IntegrationConfig/IntegrationConfig'

export type IntegrationsPopupKey = keyof typeof popupRegistry

type ExtractPayload<T> =
  T extends React.ComponentType<StackComponentProps<infer P>>
    ? P
    : never

export type IntegrationsPopupPayloads = {
  [K in keyof typeof popupRegistry]: ExtractPayload<(typeof popupRegistry)[K]>
}

export const popupRegistry = {
  'integrations.config': IntegrationConfig,
}
