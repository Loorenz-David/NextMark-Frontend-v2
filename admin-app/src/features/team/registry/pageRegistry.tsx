import type { StackComponentProps } from '@/shared/stack-manager/types'

import { TeamMainPage } from '../pages/TeamMainPage'
import { TeamInvitationsPage } from '../pages/TeamInvitationsPage'

export type TeamPageKey = keyof typeof pageRegistry

type ExtractPayload<T> =
  T extends React.ComponentType<StackComponentProps<infer P>>
    ? P
    : never

export type TeamSectionPayloads = {
  [K in keyof typeof pageRegistry]: ExtractPayload<(typeof pageRegistry)[K]>
}

export const pageRegistry = {
  'team.main': TeamMainPage,
  'team.invitations': TeamInvitationsPage,
}
