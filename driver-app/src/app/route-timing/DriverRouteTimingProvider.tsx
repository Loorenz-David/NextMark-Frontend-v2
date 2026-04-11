import type { PropsWithChildren } from 'react'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { Coordinates } from '@/shared/map'
import { useDriverBootstrapState } from '@/app/bootstrap'
import { useDriverServices } from '@/app/providers/driverServices.context'
import { useWorkspace } from '@/app/providers/workspace.context'
import { useSelectedAssignedRoute } from '@/features/route-execution/controllers/useSelectedAssignedRoute.controller'
import { syncRouteTimingFlow } from '@/features/route-execution/flows/syncRouteTiming.flow'

type LastKnownLocation = {
  coordinates: Coordinates
  observedAt: string
}

const LAST_KNOWN_LOCATION_FRESHNESS_MS = 60_000

function isFreshLocation(location: LastKnownLocation | null) {
  if (!location) {
    return false
  }

  const observedAt = new Date(location.observedAt)
  if (Number.isNaN(observedAt.getTime())) {
    return false
  }

  return (Date.now() - observedAt.getTime()) <= LAST_KNOWN_LOCATION_FRESHNESS_MS
}

export function DriverRouteTimingProvider({ children }: PropsWithChildren) {
  const { browserLocationService } = useDriverServices()
  const bootstrapState = useDriverBootstrapState()
  const { workspace } = useWorkspace()
  const selectedRoute = useSelectedAssignedRoute()

  const workspaceRef = useRef(workspace)
  const routeRef = useRef(selectedRoute)
  const routeTimingRef = useRef(bootstrapState.routeTiming)
  const lastKnownLocationRef = useRef<LastKnownLocation | null>(null)

  useEffect(() => {
    workspaceRef.current = workspace
  }, [workspace])

  useEffect(() => {
    routeRef.current = selectedRoute
  }, [selectedRoute])

  useEffect(() => {
    routeTimingRef.current = bootstrapState.routeTiming
  }, [bootstrapState.routeTiming])

  const runTimingSync = useCallback(async (currentLocation: Coordinates | null, observedTime: string) => {
    const currentWorkspace = workspaceRef.current
    const routeTiming = routeTimingRef.current

    if (!currentWorkspace?.capabilities.canExecuteRoutes || !routeTiming) {
      return
    }

    await syncRouteTimingFlow({
      route: routeRef.current,
      currentLocation,
      observedTime,
      arrivalRangeMeters: routeTiming.arrivalRangeMeters,
    })
  }, [])

  const resolveAndStoreLocation = useCallback(async () => {
    const coordinates = await browserLocationService.getCurrentCoordinates()
    const observedAt = new Date().toISOString()
    lastKnownLocationRef.current = {
      coordinates,
      observedAt,
    }
    return {
      coordinates,
      observedAt,
    }
  }, [browserLocationService])

  const runVisibleSync = useCallback(async () => {
    try {
      const resolved = await resolveAndStoreLocation()
      await runTimingSync(resolved.coordinates, resolved.observedAt)
    } catch {
      await runTimingSync(null, new Date().toISOString())
    }
  }, [resolveAndStoreLocation, runTimingSync])

  const runLeaveSync = useCallback(() => {
    const lastKnownLocation = lastKnownLocationRef.current
    if (!isFreshLocation(lastKnownLocation)) {
      return
    }

    void runTimingSync(lastKnownLocation!.coordinates, new Date().toISOString())
  }, [runTimingSync])

  useEffect(() => {
    if (!workspace?.capabilities.canExecuteRoutes || !bootstrapState.routeTiming) {
      return
    }

    const handlePageShow = () => {
      void runVisibleSync()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void runVisibleSync()
      }
    }

    const handlePageHide = () => {
      runLeaveSync()
    }

    window.addEventListener('pageshow', handlePageShow)
    window.addEventListener('pagehide', handlePageHide)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    void runVisibleSync()

    return () => {
      window.removeEventListener('pageshow', handlePageShow)
      window.removeEventListener('pagehide', handlePageHide)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [bootstrapState.routeTiming, runLeaveSync, runVisibleSync, workspace?.capabilities.canExecuteRoutes])

  useEffect(() => {
    const routeTiming = bootstrapState.routeTiming
    if (
      !workspace?.capabilities.canExecuteRoutes
      || !routeTiming
      || document.visibilityState !== 'visible'
    ) {
      return
    }

    const intervalId = window.setInterval(() => {
      void runVisibleSync()
    }, routeTiming.visibleLocationPollIntervalSeconds * 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [bootstrapState.routeTiming, runVisibleSync, workspace?.capabilities.canExecuteRoutes])

  return useMemo(() => children, [children])
}
