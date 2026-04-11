import type { AssignedRouteViewModel } from '@/app/contracts/routeExecution.types'
import type { MapMarker } from '@/shared/map'

type MapAssignedRouteToMapMarkersDependencies = {
  onMarkerClick: (stopClientId: string) => void
}

function hasRouteStarted(route: AssignedRouteViewModel) {
  return Boolean(route.route?.actual_start_time)
}

function buildRouteAnchorMarkers(route: AssignedRouteViewModel): MapMarker[] {
  const markers: MapMarker[] = []

  const startCoordinates = route.startLocation?.coordinates
  if (startCoordinates) {
    markers.push({
      id: `${route.routeClientId}:start`,
      coordinates: startCoordinates,
      interactionVariant: 'route-start',
      iconName: 'home-start',
      className: 'driver-route-marker--start',
    })
  }

  const endCoordinates = route.endLocation?.coordinates
  if (endCoordinates) {
    markers.push({
      id: `${route.routeClientId}:end`,
      coordinates: endCoordinates,
      interactionVariant: 'route-end',
      iconName: 'finish',
      className: 'driver-route-marker--end',
    })
  }

  return markers
}

export function mapAssignedRouteToMapMarkers(
  route: AssignedRouteViewModel,
  dependencies: MapAssignedRouteToMapMarkersDependencies,
): MapMarker[] {
  const started = hasRouteStarted(route)

  return [
    ...buildRouteAnchorMarkers(route),
    ...route.stops.flatMap((stop) => {
      const coordinates = stop.address?.coordinates
      if (!coordinates) {
        return []
      }

      const className = [
        stop.isActive ? 'driver-route-marker--active' : null,
        started && !stop.isCompleted && !stop.isActive ? 'driver-route-marker--pending-outline' : null,
      ]
        .filter((value): value is string => Boolean(value))
        .join(' ')

      const marker: MapMarker = {
        id: stop.stopClientId,
        coordinates,
        label: stop.stopOrder ? String(stop.stopOrder) : undefined,
        status: stop.isCompleted ? 'completed' : (stop.isActive ? 'in_progress' : 'pending'),
        interactionVariant: 'stop',
        onClick: () => dependencies.onMarkerClick(stop.stopClientId),
        className: className || undefined,
      }

      return [marker]
    }),
  ]
}
