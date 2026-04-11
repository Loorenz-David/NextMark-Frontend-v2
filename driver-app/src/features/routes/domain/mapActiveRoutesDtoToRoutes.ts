import type { ActiveRoutesDto, RouteDtoCollection } from '../api/routes.dto'
import type { ActiveRoutesPayload, DriverRouteRecord } from './routes.types'
import { mapRouteDtoToRouteRecord } from './mapRouteDtoToRouteRecord'

function mapRouteCollection(
  collection: RouteDtoCollection<import('../api/routes.dto').RouteDto>,
): RouteDtoCollection<DriverRouteRecord> {
  const byClientId = Object.fromEntries(
    Object.entries(collection.byClientId).map(([clientId, route]) => [
      clientId,
      mapRouteDtoToRouteRecord(route),
    ]),
  )

  return {
    byClientId,
    allIds: [...collection.allIds],
  }
}

export function mapActiveRoutesDtoToRoutes(
  dto: ActiveRoutesDto,
): ActiveRoutesPayload {
  return {
    routes: mapRouteCollection(dto.routes),
  }
}
