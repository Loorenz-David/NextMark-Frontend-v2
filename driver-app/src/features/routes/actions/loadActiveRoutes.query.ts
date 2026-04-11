import { getActiveRoutesApi } from '../api'
import { mapActiveRoutesDtoToRoutes, type ActiveRoutesPayload } from '../domain'

export type ActiveRoutesQueryResult = ActiveRoutesPayload

export async function loadActiveRoutesQuery(): Promise<ActiveRoutesQueryResult> {
  const response = await getActiveRoutesApi()
  const dto = response.data ?? {
    routes: { byClientId: {}, allIds: [] },
  }

  return mapActiveRoutesDtoToRoutes(dto)
}
