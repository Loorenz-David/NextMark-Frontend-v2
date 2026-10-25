
import { UserEditLayout } from './UserEdit.layout'
import { UserEditProvider } from './UserEdit.provider'

export const UserEdit = () => (
  <UserEditProvider>
    <UserEditLayout />
  </UserEditProvider>
)
