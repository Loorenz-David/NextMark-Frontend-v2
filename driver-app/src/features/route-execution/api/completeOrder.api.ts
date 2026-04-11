import type { ApiResult } from '@shared-api'
import { driverApiClient } from '@/app/services/client'
import type { CompleteOrderResponseDto } from './routeActions.dto'

export function completeOrderApi(orderId: number): Promise<ApiResult<CompleteOrderResponseDto>> {
  return driverApiClient.request<CompleteOrderResponseDto>({
    path: `/drivers/orders/${orderId}/complete`,
    method: 'POST',
  })
}
