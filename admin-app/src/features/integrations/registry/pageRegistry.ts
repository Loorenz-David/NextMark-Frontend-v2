import type { StackComponentProps } from '@/shared/stack-manager/types'

import { IntegrationsMainPage } from '../pages/IntegrationsMainPage'
import { IntegrationStatusPage } from '../pages/IntegrationStatusPage'

export type IntegrationsPageKey = keyof typeof pageRegistry

type ExtractPayload<T> =
  T extends React.ComponentType<StackComponentProps<infer P>>
    ? P
    : never

export type IntegrationsSectionPayloads = {
  [K in keyof typeof pageRegistry]: ExtractPayload<(typeof pageRegistry)[K]>
}

export const pageRegistry = {
  'integrations.main': IntegrationsMainPage,
  'integrations.status': IntegrationStatusPage
}
