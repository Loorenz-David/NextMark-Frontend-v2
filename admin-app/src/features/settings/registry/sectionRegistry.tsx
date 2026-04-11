
import type { StackComponentProps } from '@/shared/stack-manager/types'

import { pageRegistry as userPageRegistry } from '@/features/user/registry/pageRegistry'
import { pageRegistry as teamPageRegistry } from '@/features/team/registry/pageRegistry'
import { pageRegistry as integrationsPageRegistry } from '@/features/integrations/registry/pageRegistry'
import { pageRegistry as itemPageRegistry } from '@/features/itemConfigurations/registry/pageRegistry'
import { pageRegistry as vehiclePageRegistry } from '@/features/infrastructure/vehicle/registry/pageRegistry'
import { pageRegistry as facilityPageRegistry } from '@/features/infrastructure/facility/registry/pageRegistry'
import { pageRegistry as smsMessagePageRegistry } from '@/features/messaging/smsMessage/registry/pageRegistry'
import { pageRegistry as emailMessagePageRegistry } from '@/features/messaging/emailMessage/registry/pageRegistry'
import { pageRegistry as printDocumentPageRegistry } from '@/features/templates/printDocument/registry/pageRegistry'
import { pageRegistry as messagesPageRegistry } from '@/features/messaging/registry/pageRegistry'
import { pageRegistry as externalFormPageRegistry } from '@/features/externalForm/registry/pageRegistry'
export type SectionKey = keyof typeof sectionRegistry

type ExtractPayload<T> = T extends React.ComponentType<StackComponentProps<infer P>>
  ? P
  : never

export type SettingsSectionPayloads = {
  [K in keyof typeof sectionRegistry]: ExtractPayload<(typeof sectionRegistry)[K]>
}

const placeholderSection = () => <div />

export const sectionRegistry = {
  ...userPageRegistry,
  ...teamPageRegistry,
  ...integrationsPageRegistry,
  'settings.configuration': placeholderSection,
  ...smsMessagePageRegistry,
  ...emailMessagePageRegistry,
  ...printDocumentPageRegistry,
  ...messagesPageRegistry,
  ...itemPageRegistry,
  ...vehiclePageRegistry,
  ...facilityPageRegistry,
  ...externalFormPageRegistry,
}
