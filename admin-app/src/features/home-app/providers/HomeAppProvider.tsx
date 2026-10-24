import { createContext, useContext } from 'react'
import type { HomeWorkspaceType } from '../domain/homeWorkspace.types'

type HomeAppContextValue = {
  activeWorkspace: HomeWorkspaceType
  setActiveWorkspace: (workspace: HomeWorkspaceType) => void
}

export const HomeAppContext = createContext<HomeAppContextValue | null>(null)


export function useHomeApp(): HomeAppContextValue {
  const ctx = useContext(HomeAppContext)
  if (!ctx) {
    throw new Error('useHomeApp must be used inside HomeAppProvider')
  }
  return ctx
}
