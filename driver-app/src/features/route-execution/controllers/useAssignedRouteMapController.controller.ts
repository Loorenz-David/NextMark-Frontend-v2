import { useMemo } from 'react'
import { mapAssignedRouteToMapMarkers } from '../domain/mapAssignedRouteToMapMarkers'
import { mapAssignedRouteToMapRoute } from '../domain/mapAssignedRouteToMapRoute'
import type { AssignedRouteViewModel } from '@/app/contracts/routeExecution.types'

type UseAssignedRouteMapControllerDependencies = {
  onOpenStopDetail: (stopClientId: string) => void
  selectedStopClientId?: string | null
}

export function useAssignedRouteMapController(
  route: AssignedRouteViewModel | null,
  dependencies: UseAssignedRouteMapControllerDependencies,
) {
  const { onOpenStopDetail, selectedStopClientId } = dependencies
  return useMemo(() => {
    if (!route) {
      return {
        markers: [],
        mapRoute: null,
        selectedMarkerId: null,
      }
    }

    return {
      markers: mapAssignedRouteToMapMarkers(route, {
        onMarkerClick: (stopClientId) => {
          onOpenStopDetail(stopClientId)
        },
      }),
      mapRoute: mapAssignedRouteToMapRoute(route),
      selectedMarkerId: selectedStopClientId ?? route.activeStopClientId ?? null,
    }
  }, [onOpenStopDetail, route, selectedStopClientId])
}
