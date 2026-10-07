import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { HomeWorkspaceType } from '../domain/homeWorkspace.types'

type HomeAppContextValue = {
  activeWorkspace: HomeWorkspaceType
  setActiveWorkspace: (workspace: HomeWorkspaceType) => void
}

const HomeAppContext = createContext<HomeAppContextValue | null>(null)

export function HomeAppProvider({ children }: { children: ReactNode }) {
  const [activeWorkspace, setActiveWorkspace] = useState<HomeWorkspaceType>('route-operations')

  const value = useMemo(() => ({ activeWorkspace, setActiveWorkspace }), [activeWorkspace])

  return <HomeAppContext.Provider value={value}>{children}</HomeAppContext.Provider>
}

export function useHomeApp(): HomeAppContextValue {
  const ctx = useContext(HomeAppContext)
  if (!ctx) {
    throw new Error('useHomeApp must be used inside HomeAppProvider')
  }
  return ctx
}
