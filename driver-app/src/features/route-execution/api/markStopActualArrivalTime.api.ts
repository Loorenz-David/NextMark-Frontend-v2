import type { ApiResult } from '@shared-api'
import { driverApiClient } from '@/app/services/client'
import type { DriverObservedTimePayloadDto, DriverStopTimingCommandResponseDto } from './routeTiming.dto'

export function markStopActualArrivalTimeApi(
  stopClientId: string,
  data?: DriverObservedTimePayloadDto,
): Promise<ApiResult<DriverStopTimingCommandResponseDto>> {
  return driverApiClient.request<DriverStopTimingCommandResponseDto>({
    path: `/drivers/stops/${stopClientId}/actual-arrival-time`,
    method: 'POST',
    data,
  })
}
