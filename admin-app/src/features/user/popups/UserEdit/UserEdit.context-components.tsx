import type { ReactNode } from 'react'
import type { UserEditContextValue } from './UserEdit.types'
import { UserEditContext } from './UserEdit.context'

export const UserEditContextProvider = ({
  value,
  children,
}: {
  value: UserEditContextValue
  children: ReactNode
}) => <UserEditContext.Provider value={value}>{children}</UserEditContext.Provider>
