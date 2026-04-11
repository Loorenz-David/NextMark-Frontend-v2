import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { useMessageHandler } from '@shared-message-handler'
import { useWorkspace } from '@/app/providers/workspace.context'
import { markRouteActualEndTimeManualAction } from '../actions/markRouteActualEndTimeManual.action'
import { useOpenRouteStopDetail } from './useOpenRouteStopDetail.controller'
import { useRouteExecutionShell } from '../providers/routeExecutionShell.context'
import { mapAssignedRouteToPageDisplay } from '../domain/mapAssignedRouteToPageDisplay'
import { selectRouteExecutionWorkspaceState } from '../stores/routeExecution.selectors'
import { useSelectedAssignedRoute } from './useSelectedAssignedRoute.controller'

export function useAssignedRouteController() {
  const { showMessage } = useMessageHandler()
  const { workspace } = useWorkspace()
  const { store, initializeRouteWorkspace, submitRouteAction } = useRouteExecutionShell()
  const openRouteStopDetail = useOpenRouteStopDetail()
  const selectedRoute = useSelectedAssignedRoute()

  const routeState = useSyncExternalStore(
    store.subscribe,
    () => selectRouteExecutionWorkspaceState(store.getState()),
    () => selectRouteExecutionWorkspaceState(store.getState()),
  )

  const refreshAssignedRoute = useCallback(async () => {
    await initializeRouteWorkspace()
  }, [initializeRouteWorkspace])

  const startRoute = useCallback(async () => {
    if (!selectedRoute) {
      return
    }

    await submitRouteAction({
      type: 'start-route',
      routeClientId: selectedRoute.routeClientId,
    })
  }, [selectedRoute, submitRouteAction])

  const openStopDetail = useCallback((stopClientId: string) => {
    openRouteStopDetail(stopClientId, { snap: 'expanded' })
  }, [openRouteStopDetail])

  const completeRoute = useCallback(async () => {
    const routeId = selectedRoute?.route?.id
    if (!routeId) {
      return
    }

    const payload = await markRouteActualEndTimeManualAction(
      routeId,
      new Date().toISOString(),
    )

    if (payload?.recorded) {
      showMessage({ status: 200, message: 'Route marked as completed.' })
      return
    }

    if (payload?.reason === 'outside_route_window') {
      showMessage({ status: 422, message: 'Route completion was ignored because it is outside the route window.' })
      return
    }

    if (payload?.reason === 'already_recorded' || payload?.reason === 'higher_priority_recorded') {
      return
    }

    showMessage({ status: 500, message: 'Unable to mark route as completed.' })
  }, [selectedRoute, showMessage])

  const mergedRouteState = useMemo(() => ({
    ...routeState,
    route: selectedRoute,
  }), [routeState, selectedRoute])

  const pageDisplay = useMemo(
    () => mapAssignedRouteToPageDisplay(mergedRouteState.route, mergedRouteState.status, mergedRouteState.error),
    [mergedRouteState.error, mergedRouteState.route, mergedRouteState.status],
  )

  return useMemo(() => ({
    workspace,
    routeState: mergedRouteState,
    pageDisplay,
    refreshAssignedRoute,
    startRoute,
    completeRoute,
    openStopDetail,
  }), [completeRoute, mergedRouteState, openStopDetail, pageDisplay, refreshAssignedRoute, startRoute, workspace])
}
