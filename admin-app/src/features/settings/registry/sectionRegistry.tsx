
import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

import type { StackComponentProps } from '@/shared/stack-manager/types'
export type SectionKey = keyof typeof sectionRegistry

type RegistryComponent =
  | ComponentType<StackComponentProps<any>>
  | LazyExoticComponent<ComponentType<StackComponentProps<any>>>

type ExtractPayload<T> = T extends LazyExoticComponent<ComponentType<StackComponentProps<infer P>>>
  ? P
  : T extends ComponentType<StackComponentProps<infer P>>
  ? P
  : never

export type SettingsSectionPayloads = {
  [K in keyof typeof sectionRegistry]: ExtractPayload<(typeof sectionRegistry)[K]>
}

const placeholderSection = (_: StackComponentProps<undefined>) => <div />

export const sectionRegistry = {
  'user.main': lazy(() =>
    import('@/features/user/pages/UserMainPage').then((module) => ({
      default: module.UserMainPage,
    })),
  ),
  'team.main': lazy(() =>
    import('@/features/team/pages/TeamMainPage').then((module) => ({
      default: module.TeamMainPage,
    })),
  ),
  'team.invitations': lazy(() =>
    import('@/features/team/pages/TeamInvitationsPage').then((module) => ({
      default: module.TeamInvitationsPage,
    })),
  ),
  'integrations.main': lazy(() =>
    import('@/features/integrations/pages/IntegrationsMainPage').then((module) => ({
      default: module.IntegrationsMainPage,
    })),
  ),
  'integrations.status': lazy(() =>
    import('@/features/integrations/pages/IntegrationStatusPage').then((module) => ({
      default: module.IntegrationStatusPage,
    })),
  ),
  'settings.configuration': placeholderSection,
  'smsMessage.main': lazy(() =>
    import('@/features/messaging/smsMessage/pages/SmsMessageMainPage').then((module) => ({
      default: module.SmsMessageMainPage,
    })),
  ),
  'emailMessage.main': lazy(() =>
    import('@/features/messaging/emailMessage/pages/EmailMessageMainPage').then((module) => ({
      default: module.EmailMessageMainPage,
    })),
  ),
  'printDocument.main': lazy(() =>
    import('@/features/templates/printDocument/pages/PrintTemplateMainPage').then((module) => ({
      default: module.PrintTemplateMainPage,
    })),
  ),
  'messages.main': lazy(() =>
    import('@/features/messaging/pages/MessagesMainPage').then((module) => ({
      default: module.MessagesMainPage,
    })),
  ),
  'item.main': lazy(() =>
    import('@/features/itemConfigurations/pages/ItemMainPage').then((module) => ({
      default: module.ItemMainPage,
    })),
  ),
  'vehicle.main': lazy(() =>
    import('@/features/infrastructure/vehicle/pages/VehicleMainPage').then((module) => ({
      default: module.VehicleMainPage,
    })),
  ),
  'facility.main': lazy(() =>
    import('@/features/infrastructure/facility/pages/FacilityMainPage').then((module) => ({
      default: module.FacilityMainPage,
    })),
  ),
  'externalForm.access': lazy(() =>
    import('@/features/externalForm/pages/ExternalFormAccess.page').then((module) => ({
      default: module.ExternalFormAccessPage,
    })),
  ),
} satisfies Record<string, RegistryComponent>
