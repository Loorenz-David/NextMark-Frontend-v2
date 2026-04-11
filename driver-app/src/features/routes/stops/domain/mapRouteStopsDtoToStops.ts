import type { RouteStopsDto } from '../api'
import type { RouteStopsPayload } from './stops.types'

export function mapRouteStopsDtoToStops(dto: RouteStopsDto): RouteStopsPayload {
  return {
    stops: {
      byClientId: { ...dto.stops.byClientId },
      allIds: [...dto.stops.allIds],
    },
  }
}
