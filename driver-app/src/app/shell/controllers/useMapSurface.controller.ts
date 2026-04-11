import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { MAP_MARKER_LAYERS } from '@/shared/map'
import { useDriverAppShell } from '../providers/driverAppShell.context'
import { mapCurrentLocationToMarker } from '../domain/mapCurrentLocationToMarker'
import { selectBottomSheetState, selectMapSurfaceState } from '../stores/shell.selectors'
import { useOpenRouteStopDetail, useRouteExecutionMapSurfaceController } from '@/features/route-execution'

export function useMapSurfaceController() {
  const { store } = useDriverAppShell()
  const openRouteStopDetail = useOpenRouteStopDetail()

  const shellState = useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState,
  )

  const mapSurfaceState = useMemo(() => selectMapSurfaceState(shellState), [shellState])
  const bottomSheetState = useMemo(() => selectBottomSheetState(shellState), [shellState])

  const selectedStopClientId = bottomSheetState.currentPage?.page === 'route-stop-detail'
    ? bottomSheetState.currentPage.params.stopClientId
    : null

  const handleOpenStopDetail = useCallback((stopClientId: string) => {
    openRouteStopDetail(stopClientId)
  }, [openRouteStopDetail])

  const routeMapState = useRouteExecutionMapSurfaceController({
    selectedStopClientId,
    onOpenStopDetail: handleOpenStopDetail,
  })

  const userLocationMarkers = useMemo(() => (
    mapSurfaceState.currentLocation ? [mapCurrentLocationToMarker(mapSurfaceState.currentLocation)] : []
  ), [mapSurfaceState.currentLocation])

  return useMemo(() => ({
    ...mapSurfaceState,
    ...routeMapState,
    markerLayers: [{
      layerId: MAP_MARKER_LAYERS.userLocation,
      markers: userLocationMarkers,
    }],
  }), [mapSurfaceState, routeMapState, userLocationMarkers])
}
