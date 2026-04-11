import { MapView } from '@/shared/map'
import type { MapMarker, MapRoute } from '@/shared/map'

type AssignedRouteMapPanelProps = {
  markers: MapMarker[]
  mapRoute: MapRoute | null
  selectedMarkerId: string | null
}

export function AssignedRouteMapPanel({
  markers,
  mapRoute,
  selectedMarkerId,
}: AssignedRouteMapPanelProps) {
  if (!markers.length && !mapRoute) {
    return null
  }

  return (
    <section className="route-card">
      <div className="page-header">
        <div>
          <div className="driver-kicker">Route map</div>
          <h3>Stops and route</h3>
        </div>
      </div>

      <MapView
        className="driver-map"
        markers={markers}
        route={mapRoute}
        selectedMarkerId={selectedMarkerId}
      />
    </section>
  )
}
