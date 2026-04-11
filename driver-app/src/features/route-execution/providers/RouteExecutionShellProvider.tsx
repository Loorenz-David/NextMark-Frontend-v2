import type { PropsWithChildren } from 'react'
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import type { DriverRouteActionCommand } from '@/app/contracts/routeExecution.types'
import { useWorkspace } from '@/app/providers/workspace.context'
import { useDriverAppShell } from '@/app/shell'
import { useDriverOrderStateRegistry } from '@/features/order-states'
import { selectSelectedRoute, useRoutesSelectionStore, useRoutesStore } from '@/features/routes'
import { initializeRouteWorkspaceFlow } from '../flows/initializeRouteWorkspace.flow'
import { submitRouteActionFlow } from '../flows/submitRouteAction.flow'
import {
  createInitialRouteExecutionStoreState,
  createRouteExecutionStore,
} from '../stores/routeExecution.store'
import { selectAssignedRoute } from '../stores/routeExecution.selectors'
import { RouteExecutionShellContext } from './routeExecutionShell.context'

const isRouteExecutionPage = (page: string | undefined | null) => {
  return page === 'route-workspace' || page === 'route-stop-detail'
}

export function RouteExecutionShellProvider({ children }: PropsWithChildren) {
  const { workspace } = useWorkspace()
  const { store: shellStore } = useDriverAppShell()
  const orderStateRegistry = useDriverOrderStateRegistry()
  const routesState = useRoutesStore((state) => state)
  const routesSelectionState = useRoutesSelectionStore((state) => state)
  const [store] = useState(() => createRouteExecutionStore(createInitialRouteExecutionStoreState()))
  const [stopDetailTransitionDirection, setStopDetailTransitionDirection] = useState<'forward' | 'backward'>('forward')
  const [routeViewMode, setRouteViewMode] = useState<'route' | 'search'>('route')
  const [routeSearchQuery, setRouteSearchQuery] = useState('')
  const shellState = useSyncExternalStore(shellStore.subscribe, shellStore.getState, shellStore.getState)
  const selectedRoute = useMemo(
    () => selectSelectedRoute(routesSelectionState, routesState),
    [routesSelectionState, routesState],
  )

  const initializeRouteWorkspace = useCallback(async () => {
    await initializeRouteWorkspaceFlow({
      workspace,
      store,
      orderStateIds: {
        processingId: orderStateRegistry.getStateIdByName('Processing'),
        completedId: orderStateRegistry.getStateIdByName('Completed'),
        failId: orderStateRegistry.getStateIdByName('Fail'),
      },
    })
  }, [orderStateRegistry, store, workspace])

  const submitRouteAction = useCallback(async (command: DriverRouteActionCommand) => submitRouteActionFlow({
    workspace,
    store,
    command,
    orderStateIds: {
      processingId: orderStateRegistry.getStateIdByName('Processing'),
      completedId: orderStateRegistry.getStateIdByName('Completed'),
      failId: orderStateRegistry.getStateIdByName('Fail'),
    },
  }), [orderStateRegistry, store, workspace])

  useEffect(() => {
    if (!isRouteExecutionPage(shellState.bottomSheetStack.at(-1)?.page)) {
      return
    }

    queueMicrotask(() => {
      void initializeRouteWorkspace()
    })
  }, [
    initializeRouteWorkspace,
    selectedRoute?._representation,
    selectedRoute?.id,
    selectedRoute?.delivery_plan?.updated_at,
    shellState.bottomSheetStack,
  ])

  const resetRouteSearchQuery = useCallback(() => {
    setRouteSearchQuery('')
  }, [])

  const prepareRouteStopDetailTransition = useCallback((previousStopClientId: string | null, stopClientId: string) => {
    const assignedRoute = selectAssignedRoute(store.getState(), {
      processingId: orderStateRegistry.getStateIdByName('Processing'),
      completedId: orderStateRegistry.getStateIdByName('Completed'),
      failId: orderStateRegistry.getStateIdByName('Fail'),
    })

    if (previousStopClientId === stopClientId) {
      return false
    }

    const previousIndex = previousStopClientId
      ? assignedRoute?.stops.findIndex((candidate) => candidate.stopClientId === previousStopClientId) ?? -1
      : -1
    const nextIndex = assignedRoute?.stops.findIndex((candidate) => candidate.stopClientId === stopClientId) ?? -1

    setStopDetailTransitionDirection(previousIndex >= 0 && nextIndex >= 0 && nextIndex < previousIndex ? 'backward' : 'forward')
    return true
  }, [store])

  const openRouteSearch = useCallback(() => {
    setRouteViewMode('search')
  }, [])

  const closeRouteSearch = useCallback(() => {
    const activeElement = document.activeElement
    if (activeElement instanceof HTMLElement) {
      activeElement.blur()
    }

    setRouteViewMode('route')
    setRouteSearchQuery('')
  }, [])

  const value = useMemo(() => ({
    store,
    initializeRouteWorkspace,
    submitRouteAction,
    stopDetailTransitionDirection,
    prepareRouteStopDetailTransition,
    routeViewMode,
    openRouteSearch,
    closeRouteSearch,
    routeSearchQuery,
    setRouteSearchQuery,
    resetRouteSearchQuery,
  }), [
    closeRouteSearch,
    initializeRouteWorkspace,
    openRouteSearch,
    prepareRouteStopDetailTransition,
    resetRouteSearchQuery,
    routeSearchQuery,
    routeViewMode,
    stopDetailTransitionDirection,
    store,
    submitRouteAction,
  ])

  return <RouteExecutionShellContext.Provider value={value}>{children}</RouteExecutionShellContext.Provider>
}
