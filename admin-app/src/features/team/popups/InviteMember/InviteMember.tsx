import type { StackComponentProps } from '@/shared/stack-manager/types'

import { InviteMemberProvider } from './InviteMember.provider'
import { InviteMemberLayout } from './InviteMember.layout'

export const InviteMember = (_: StackComponentProps<undefined>) => (
  <InviteMemberProvider>
    <InviteMemberLayout />
  </InviteMemberProvider>
)
