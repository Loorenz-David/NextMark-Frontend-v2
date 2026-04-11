import type { ApiResult } from '@shared-api'
import { driverApiClient } from '@/app/services/client'
import type { UndoTerminalOrderResponseDto } from './routeActions.dto'

export function undoTerminalOrderApi(
  orderId: number,
): Promise<ApiResult<UndoTerminalOrderResponseDto>> {
  return driverApiClient.request<UndoTerminalOrderResponseDto>({
    path: `/drivers/orders/${orderId}/undo-terminal`,
    method: 'POST',
  })
}
