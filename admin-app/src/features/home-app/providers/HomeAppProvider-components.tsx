import { useMemo, useState, type ReactNode } from 'react'
import type { HomeWorkspaceType } from '../domain/homeWorkspace.types'
import { HomeAppContext } from './HomeAppProvider'

export function HomeAppProvider({ children }: { children: ReactNode }) {
  const [activeWorkspace, setActiveWorkspace] = useState<HomeWorkspaceType>('route-operations')

  const value = useMemo(() => ({ activeWorkspace, setActiveWorkspace }), [activeWorkspace])

  return <HomeAppContext.Provider value={value}>{children}</HomeAppContext.Provider>
}
