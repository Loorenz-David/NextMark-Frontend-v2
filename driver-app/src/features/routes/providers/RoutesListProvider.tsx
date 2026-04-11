import type { PropsWithChildren } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useWorkspace } from '@/app/providers/workspace.context'
import { initializeActiveRoutesFlow } from '../flows'
import {
  selectAllRoutes,
  selectSelectedRouteClientId,
  useRoutesSelectionStore,
  useRoutesStore,
} from '../stores'
import { RoutesListContext } from './routesList.context'

type RoutesListProviderProps = PropsWithChildren<{
  onSelectRoute?: (routeClientId: string) => void
}>

export function RoutesListProvider({ children, onSelectRoute }: RoutesListProviderProps) {
  const { workspace } = useWorkspace()
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  const routesState = useRoutesStore((state) => state)
  const selectedRouteClientId = useRoutesSelectionStore(selectSelectedRouteClientId)
  const routes = useMemo(() => (
    [...selectAllRoutes(routesState)].sort(compareRoutesForList)
  ), [routesState])

  const refreshRoutes = useCallback(async () => {
    if (!workspace) {
      setStatus('error')
      setError('Workspace unavailable.')
      return
    }

    setStatus('loading')
    setError(null)

    try {
      await initializeActiveRoutesFlow({
        workspaceScopeKey: workspace.workspaceScopeKey,
      })
      setStatus('ready')
    } catch (cause) {
      console.error('Failed to load routes list', cause)
      setStatus('error')
      setError('Unable to load routes.')
    }
  }, [workspace])

  useEffect(() => {
    let isCancelled = false

    async function initializeRoutesList() {
      if (!workspace) {
        if (!isCancelled) {
          setStatus('error')
          setError('Workspace unavailable.')
        }
        return
      }

      try {
        await initializeActiveRoutesFlow({
          workspaceScopeKey: workspace.workspaceScopeKey,
        })

        if (isCancelled) {
          return
        }

        setStatus('ready')
        setError(null)
      } catch (cause) {
        console.error('Failed to initialize routes list', cause)

        if (isCancelled) {
          return
        }

        setStatus('error')
        setError('Unable to load routes.')
      }
    }

    void initializeRoutesList()

    return () => {
      isCancelled = true
    }
  }, [workspace])

  const value = useMemo(() => ({
    routes,
    selectedRouteClientId,
    status,
    error,
    refreshRoutes,
    onSelectRoute,
  }), [error, onSelectRoute, refreshRoutes, routes, selectedRouteClientId, status])

  return (
    <RoutesListContext.Provider value={value}>
      {children}
    </RoutesListContext.Provider>
  )
}

function compareRoutesForList(left: ReturnType<typeof selectAllRoutes>[number], right: ReturnType<typeof selectAllRoutes>[number]) {
  const rightTimestamp = Date.parse(right.delivery_plan?.updated_at ?? right.created_at ?? '') || 0
  const leftTimestamp = Date.parse(left.delivery_plan?.updated_at ?? left.created_at ?? '') || 0
  if (rightTimestamp !== leftTimestamp) {
    return rightTimestamp - leftTimestamp
  }

  return (right.id ?? 0) - (left.id ?? 0)
}
