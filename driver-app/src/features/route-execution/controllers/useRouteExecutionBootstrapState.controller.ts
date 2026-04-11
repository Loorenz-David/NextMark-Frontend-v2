import { useSyncExternalStore } from 'react'
import { useRouteExecutionShell } from '../providers/routeExecutionShell.context'
import { selectRouteExecutionWorkspaceState } from '../stores/routeExecution.selectors'

export function useRouteExecutionBootstrapStateController() {
  const { store } = useRouteExecutionShell()

  return useSyncExternalStore(
    store.subscribe,
    () => selectRouteExecutionWorkspaceState(store.getState()),
    () => selectRouteExecutionWorkspaceState(store.getState()),
  )
}
