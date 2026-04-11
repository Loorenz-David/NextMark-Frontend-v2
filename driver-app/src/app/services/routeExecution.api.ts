import type { ApiResult } from '@shared-api'
import type { DriverCommandEnvelope, DriverRouteActionCommand, DriverRouteActionResult } from '../contracts/routeExecution.types'
import { driverApiClient } from './client'

export const routeExecutionApi = {
  executeRouteAction: (
    envelope: DriverCommandEnvelope<DriverRouteActionCommand>,
  ): Promise<ApiResult<DriverRouteActionResult>> =>
    driverApiClient.request<DriverRouteActionResult>({
      path: '/drivers/routes/actions',
      method: 'POST',
      data: envelope,
    }),
}
