import { createContext, useContext } from 'react'
import type { DriverWorkspaceContext, WorkspaceSwitchCommand } from '../contracts/driverSession.types'

export type WorkspaceContextValue = {
  workspace: DriverWorkspaceContext | null
  isSwitchingWorkspace: boolean
  switchWorkspaceError?: string
  switchWorkspace: (command: WorkspaceSwitchCommand) => Promise<boolean>
}

export const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (!context) {
    throw new Error('useWorkspace must be used within WorkspaceProvider')
  }
  return context
}
