import { apiClient } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'

export const integrationEmailApi = {
  connect: (payload: Record<string, unknown>): Promise<ApiResult<unknown>> =>
    apiClient.request<unknown>({
      path: '/email/connect',
      method: 'POST',
      data: payload,
    }),
  getDetails: (id: number): Promise<ApiResult<unknown>> =>
    apiClient.request<unknown>({
      path: `/email/${id}`,
      method: 'GET',
    }),
  update: (id: number, payload: Record<string, unknown>): Promise<ApiResult<unknown>> =>
    apiClient.request<unknown>({
      path: `/email/${id}`,
      method: 'PATCH',
      data: payload,
    }),
  disconnect: (id: number): Promise<ApiResult<unknown>> =>
    apiClient.request<unknown>({
      path: `/email/${id}`,
      method: 'DELETE',
    }),
}
