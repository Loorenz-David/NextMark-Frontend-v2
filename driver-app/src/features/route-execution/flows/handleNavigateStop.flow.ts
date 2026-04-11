import type { AssignedRouteViewModel, AssignedStopViewModel } from '@/app/contracts/routeExecution.types'
import type { DriverServices } from '@/app/providers/driverServices.context'
import type { MapNavigationDestination } from '@/app/services/mapNavigation.service'
import { buildMapNavigationDestination } from '../domain/buildMapNavigationDestination'
import { handleNavigateStopTimingFlow } from './handleNavigateStopTiming.flow'

type HandleNavigateStopFlowDependencies = {
  route: AssignedRouteViewModel | null
  stop: AssignedStopViewModel | null
  arrivalRangeMeters: number | null
  services: Pick<
    DriverServices,
    'browserLocationService' | 'mapAppPreferenceService' | 'mapNavigationService'
  >
  openMapAppChooser: (destination: MapNavigationDestination) => void
}

type HandleNavigateStopFlowResult =
  | { status: 'launched' | 'chooser-opened' }
  | { status: 'missing-destination' }

export function handleNavigateStopFlow({
  route,
  stop,
  arrivalRangeMeters,
  services,
  openMapAppChooser,
}: HandleNavigateStopFlowDependencies): HandleNavigateStopFlowResult {
  if (!route || !stop) {
    return { status: 'missing-destination' }
  }

  const destination = buildMapNavigationDestination(stop)
  if (!destination) {
    return { status: 'missing-destination' }
  }

  const preferredApp = services.mapAppPreferenceService.getPreferredApp()
  if (preferredApp && services.mapNavigationService.isKnownAppId(preferredApp)) {
    services.mapNavigationService.launch(preferredApp, destination)
  } else {
    openMapAppChooser(destination)
  }

  void handleNavigateStopTimingFlow({
    route,
    stopClientId: stop.stopClientId,
    getCurrentCoordinates: services.browserLocationService.getCurrentCoordinates,
    arrivalRangeMeters,
  })

  return {
    status: preferredApp && services.mapNavigationService.isKnownAppId(preferredApp)
      ? 'launched'
      : 'chooser-opened',
  }
}
