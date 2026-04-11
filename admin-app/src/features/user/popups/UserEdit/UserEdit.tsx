import type { StackComponentProps } from '@/shared/stack-manager/types'

import { UserEditLayout } from './UserEdit.layout'
import { UserEditProvider } from './UserEdit.provider'

export const UserEdit = (_: StackComponentProps<undefined>) => (
  <UserEditProvider>
    <UserEditLayout />
  </UserEditProvider>
)
