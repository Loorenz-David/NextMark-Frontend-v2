import { createContext, useContext } from 'react'

import type { UserEditContextValue } from './UserEdit.types'

export const UserEditContext = createContext<UserEditContextValue | null>(null)


export const useUserEdit = () => {
  const context = useContext(UserEditContext)
  if (!context) {
    throw new Error('UserEditContext is not available. Wrap your app with UserEditProvider.')
  }
  return context
}
