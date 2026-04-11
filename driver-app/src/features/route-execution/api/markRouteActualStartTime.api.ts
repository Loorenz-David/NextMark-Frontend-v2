import type { ApiResult } from '@shared-api'
import { driverApiClient } from '@/app/services/client'
import type { DriverObservedTimePayloadDto, DriverRouteTimingCommandResponseDto } from './routeTiming.dto'

export function markRouteActualStartTimeApi(
  routeSolutionId: number,
  data?: DriverObservedTimePayloadDto,
): Promise<ApiResult<DriverRouteTimingCommandResponseDto>> {
  return driverApiClient.request<DriverRouteTimingCommandResponseDto>({
    path: `/drivers/routes/${routeSolutionId}/actual-start-time`,
    method: 'POST',
    data,
  })
}
