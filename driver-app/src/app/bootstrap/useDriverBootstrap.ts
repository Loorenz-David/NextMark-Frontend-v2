import { useMemo } from 'react'
import type { DriverBootstrapResult } from '../contracts/driverSession.types'
import { useRouteExecutionBootstrapStateController } from '@/features/route-execution'
import { useSession } from '../providers/session.context'
import { useWorkspace } from '../providers/workspace.context'
import { useDriverBootstrapState } from './useDriverBootstrapState'

export const useDriverBootstrap = (): DriverBootstrapResult => {
  const { session } = useSession()
  const { workspace } = useWorkspace()
  const routeState = useRouteExecutionBootstrapStateController()
  const appBootstrapState = useDriverBootstrapState()

  return useMemo(() => ({
    restoredSession: Boolean(session),
    hydratedWorkspace: workspace
      ? routeState.status !== 'loading' && appBootstrapState.status === 'ready'
      : false,
  }), [appBootstrapState.status, routeState.status, session, workspace])
}
