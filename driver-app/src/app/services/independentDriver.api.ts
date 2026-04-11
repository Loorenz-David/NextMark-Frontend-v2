import type { ApiResult } from '@shared-api'
import type { QuickOrderDraft, QuickRouteDraft } from '../contracts/routeExecution.types'
import { driverApiClient } from './client'

export const independentDriverApi = {
  createQuickOrder: (draft: QuickOrderDraft): Promise<ApiResult<Record<string, never>>> =>
    driverApiClient.request<Record<string, never>>({
      path: '/drivers/orders/quick',
      method: 'POST',
      data: draft,
    }),

  createQuickRoute: (draft: QuickRouteDraft): Promise<ApiResult<Record<string, never>>> =>
    driverApiClient.request<Record<string, never>>({
      path: '/drivers/routes/quick',
      method: 'POST',
      data: draft,
    }),
}
