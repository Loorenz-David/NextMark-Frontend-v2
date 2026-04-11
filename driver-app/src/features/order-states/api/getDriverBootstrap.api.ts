import type { ApiResult } from '@shared-api'
import { driverApiClient } from '@/app/services/client'
import type { DriverBootstrapDto } from './orderStates.dto'

export function getDriverBootstrapApi(): Promise<ApiResult<DriverBootstrapDto>> {
  return driverApiClient.request<DriverBootstrapDto>({
    path: '/drivers/bootstrap',
    method: 'GET',
  })
}
