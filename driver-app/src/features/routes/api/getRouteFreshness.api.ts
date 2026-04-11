import type { ApiResult } from '@shared-api'
import { driverApiClient } from '@/app/services/client'
import type { RouteFreshnessDto } from './routes.dto'

export function getRouteFreshnessApi(routeSolutionId: number): Promise<ApiResult<RouteFreshnessDto>> {
  return driverApiClient.request<RouteFreshnessDto>({
    path: `/drivers/routes/${routeSolutionId}/freshness`,
    method: 'GET',
  })
}
