import type { ReactNode } from 'react'
import type { User } from '../types/user'
export type UserContextValue = {
  user: User | null
}
import { UserContext } from './UserContext'

export const UserContextProvider = ({ value, children }: { value: UserContextValue; children: ReactNode }) => (
  <UserContext.Provider value={value}>{children}</UserContext.Provider>
)
