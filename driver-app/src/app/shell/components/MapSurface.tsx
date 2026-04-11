import { MapView } from '@/shared/map'
import { DRIVER_SHELL_CONFIG } from '../domain/shell.config'
import { useMapSurfaceController } from '../controllers/useMapSurface.controller'

export function MapSurface() {
  const controller = useMapSurfaceController()
  const mapSurfaceBottom = `calc(${controller.bottomInsetPercent}% - ${DRIVER_SHELL_CONFIG.map.overlapBehindSheetPx}px)`

  return (
    <section
      aria-hidden={controller.isInteractionBlocked}
      className={`driver-map-surface${controller.isInteractionBlocked ? ' is-blocked' : ''}${controller.bottomSheetMotionState === 'snapping' ? ' is-snapping' : ''}`}
      style={{ bottom: mapSurfaceBottom }}
    >
      <MapView
        className="driver-map driver-map--surface"
        markers={controller.markers}
        markerLayers={controller.markerLayers}
        focusCoordinates={controller.currentLocation}
        focusRequestKey={controller.currentLocationFocusRequestKey}
        route={controller.mapRoute}
        selectedMarkerId={controller.selectedMarkerId}
      />
    </section>
  )
}
