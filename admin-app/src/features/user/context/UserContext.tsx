import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'

import type { User } from '../types/user'

export type UserContextValue = {
  user: User | null
}

export const UserContext = createContext<UserContextValue | null>(null)

export const UserContextProvider = ({ value, children }: { value: UserContextValue; children: ReactNode }) => (
  <UserContext.Provider value={value}>{children}</UserContext.Provider>
)

export const useUserContext = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUserContext must be used within UserProvider')
  }
  return context
}
