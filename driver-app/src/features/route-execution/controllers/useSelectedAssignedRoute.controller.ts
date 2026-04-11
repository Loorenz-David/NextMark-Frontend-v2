import { useMemo, useSyncExternalStore } from 'react'
import { useDriverOrderStateRegistry } from '@/features/order-states'
import { useRouteExecutionShell } from '../providers/routeExecutionShell.context'
import {
  selectAssignedRoute,
  selectRouteExecutionWorkspaceState,
} from '../stores/routeExecution.selectors'

export function useSelectedAssignedRoute() {
  const { store } = useRouteExecutionShell()
  const orderStateRegistry = useDriverOrderStateRegistry()
  const orderStateIds = {
    processingId: orderStateRegistry.getStateIdByName('Processing'),
    completedId: orderStateRegistry.getStateIdByName('Completed'),
    failId: orderStateRegistry.getStateIdByName('Fail'),
  }
  const workspaceState = useSyncExternalStore(
    store.subscribe,
    () => selectRouteExecutionWorkspaceState(store.getState()),
    () => selectRouteExecutionWorkspaceState(store.getState()),
  )

  return useMemo(
    () => selectAssignedRoute({ workspace: workspaceState }, orderStateIds),
    [orderStateIds, workspaceState],
  )
}
