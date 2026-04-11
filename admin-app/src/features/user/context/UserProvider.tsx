import type { PropsWithChildren } from 'react'
import { useMemo } from 'react'

import { useCurrentUser } from '../store/user.store'
import { UserContextProvider } from './UserContext'

export const UserProvider = ({ children }: PropsWithChildren) => {
  const user = useCurrentUser()
  const value = useMemo(() => ({ user }), [user])

  return <UserContextProvider value={value}>{children}</UserContextProvider>
}
