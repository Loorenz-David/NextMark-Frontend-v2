import type { ApiResult } from '@shared-api'
import { driverApiClient } from '@/app/services/client'
import type { ActiveRoutesDto } from './routes.dto'

export function getActiveRoutesApi(): Promise<ApiResult<ActiveRoutesDto>> {
  return driverApiClient.request<ActiveRoutesDto>({
    path: '/drivers/routes/active',
    method: 'GET',
  })
}
