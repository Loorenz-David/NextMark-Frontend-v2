import type { DriverRouteRecord } from '../domain'
import { routeSnapshotMetaStore } from './routeSnapshotMeta.store'

export function setRouteSnapshotMeta(
  route: DriverRouteRecord | null,
  hydratedRouteId: number | null,
  hydratedRouteFreshnessUpdatedAt: string | null,
) {
  routeSnapshotMetaStore.setState({
    route,
    hydratedRouteId,
    hydratedRouteFreshnessUpdatedAt,
  })
}

export function clearRouteSnapshotMeta() {
  setRouteSnapshotMeta(null, null, null)
}
