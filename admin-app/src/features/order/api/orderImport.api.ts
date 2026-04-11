import { apiClient } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'

export const uploadOrderCsv = (
  file: File,
  routePlanId?: number,
): Promise<ApiResult<Record<string, never>>> => {
  const formData = new FormData()
  formData.append('file', file)

  return apiClient.request<Record<string, never>>({
    path: '/orders/import',
    method: 'PUT',
    query: routePlanId != null ? { route_plan_id: routePlanId } : undefined,
    data: formData,
  })
}

export const useUploadOrderCsv = () => uploadOrderCsv
