import { createContext, useContext, useState, type ReactNode } from 'react'
import type { HomeWorkspaceType } from '../domain/homeWorkspace.types'

type HomeAppContextValue = {
  activeWorkspace: HomeWorkspaceType
  setActiveWorkspace: (workspace: HomeWorkspaceType) => void
  headerActions: ReactNode | null
  setHeaderActions: (actions: ReactNode | null) => void
}

const HomeAppContext = createContext<HomeAppContextValue | null>(null)

export function HomeAppProvider({ children }: { children: ReactNode }) {
  const [activeWorkspace, setActiveWorkspace] = useState<HomeWorkspaceType>('route-operations')
  const [headerActions, setHeaderActions] = useState<ReactNode | null>(null)

  return (
    <HomeAppContext.Provider
      value={{ activeWorkspace, setActiveWorkspace, headerActions, setHeaderActions }}
    >
      {children}
    </HomeAppContext.Provider>
  )
}

export function useHomeApp(): HomeAppContextValue {
  const ctx = useContext(HomeAppContext)
  if (!ctx) {
    throw new Error('useHomeApp must be used inside HomeAppProvider')
  }
  return ctx
}
