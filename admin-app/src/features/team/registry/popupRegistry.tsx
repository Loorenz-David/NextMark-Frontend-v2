import type { StackComponentProps } from '@/shared/stack-manager/types'

import { InviteMember } from '../popups/InviteMember/InviteMember'

export type TeamPopupKey = keyof typeof popupRegistry

type ExtractPayload<T> =
  T extends React.ComponentType<StackComponentProps<infer P>>
    ? P
    : never

export type TeamPopupPayloads = {
  [K in keyof typeof popupRegistry]: ExtractPayload<(typeof popupRegistry)[K]>
}

export const popupRegistry = {
  'team.invite.create': InviteMember,
}
