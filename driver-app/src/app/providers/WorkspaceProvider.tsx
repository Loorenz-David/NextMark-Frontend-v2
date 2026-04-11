import type { PropsWithChildren } from 'react'
import { useCallback, useMemo, useState } from 'react'
import type { WorkspaceSwitchCommand } from '../contracts/driverSession.types'
import { buildWorkspaceContext } from '../lib/driverWorkspace'
import { useDriverServices } from './driverServices.context'
import { useSession } from './session.context'
import { WorkspaceContext } from './workspace.context'

export function WorkspaceProvider({ children }: PropsWithChildren) {
  const { session, applyTokenResponse } = useSession()
  const { driverModeApi } = useDriverServices()
  const [isSwitchingWorkspace, setIsSwitchingWorkspace] = useState(false)
  const [switchWorkspaceError, setSwitchWorkspaceError] = useState<string>()

  const workspace = useMemo(() => buildWorkspaceContext(session), [session])

  const switchWorkspace = useCallback(async (command: WorkspaceSwitchCommand) => {
    setIsSwitchingWorkspace(true)
    setSwitchWorkspaceError(undefined)

    try {
      const response = await driverModeApi.switchWorkspace(command)
      if (!response.data?.access_token || !response.data?.refresh_token) {
        setSwitchWorkspaceError('Workspace switch did not return updated session tokens.')
        return false
      }

      applyTokenResponse(response.data)
      return true
    } catch (error) {
      console.error('Failed to switch driver workspace', error)
      setSwitchWorkspaceError('Unable to switch workspace.')
      return false
    } finally {
      setIsSwitchingWorkspace(false)
    }
  }, [applyTokenResponse, driverModeApi])

  const value = useMemo(() => ({
    workspace,
    isSwitchingWorkspace,
    switchWorkspaceError,
    switchWorkspace,
  }), [isSwitchingWorkspace, switchWorkspace, switchWorkspaceError, workspace])

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}
