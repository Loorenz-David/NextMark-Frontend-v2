import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { useMessageHandler } from '@shared-message-handler'
import { useWorkspace } from '@/app/providers/workspace.context'
import { useDriverServices } from '@/app/providers/driverServices.context'
import { useDriverBootstrapState } from '@/app/bootstrap'
import { useDriverAppShell } from '@/app/shell/providers/driverAppShell.context'
import { markRouteActualEndTimeManualAction } from '../actions/markRouteActualEndTimeManual.action'
import { useOpenRouteStopDetail } from './useOpenRouteStopDetail.controller'
import { useRouteExecutionShell } from '../providers/routeExecutionShell.context'
import { mapAssignedRouteToPageDisplay } from '../domain/mapAssignedRouteToPageDisplay'
import { selectRouteExecutionWorkspaceState } from '../stores/routeExecution.selectors'
import { useSelectedAssignedRoute } from './useSelectedAssignedRoute.controller'
import { buildMapNavigationDestinationFromAddress } from '../domain/buildMapNavigationDestinationFromAddress'

export function useAssignedRouteController() {
  const { showMessage } = useMessageHandler()
  const { workspace } = useWorkspace()
  const bootstrapState = useDriverBootstrapState()
  const { browserLocationService, mapAppPreferenceService, mapNavigationService } = useDriverServices()
  const { openSlidingPage } = useDriverAppShell()
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

  const navigateToLocation = useCallback(async (label: string, address: typeof selectedRoute['startLocation']) => {
    const destination = buildMapNavigationDestinationFromAddress(label, address)
    if (!destination) {
      showMessage({ status: 'warning', message: 'This location has no usable destination for navigation.' })
      return
    }

    const preferredApp = mapAppPreferenceService.getPreferredApp()
    if (preferredApp && mapNavigationService.isKnownAppId(preferredApp)) {
      mapNavigationService.launch(preferredApp, destination)
    } else {
      openSlidingPage('map-app-chooser', { destination })
    }
  }, [mapAppPreferenceService, mapNavigationService, openSlidingPage, showMessage])

  const navigateToStart = useCallback(() => {
    if (!selectedRoute) {
      return
    }
    void navigateToLocation('Start location', selectedRoute.startLocation)
  }, [selectedRoute, navigateToLocation])

  const navigateToEnd = useCallback(() => {
    if (!selectedRoute) {
      return
    }
    void navigateToLocation('End location', selectedRoute.endLocation)
  }, [selectedRoute, navigateToLocation])

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
    navigateToStart,
    navigateToEnd,
  }), [completeRoute, mergedRouteState, navigateToEnd, navigateToStart, openStopDetail, pageDisplay, refreshAssignedRoute, startRoute, workspace])
}
