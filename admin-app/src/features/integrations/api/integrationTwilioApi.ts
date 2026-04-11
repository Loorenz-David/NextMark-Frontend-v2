import { apiClient } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'

export const integrationTwilioApi = {
  connect: (payload: Record<string, unknown>): Promise<ApiResult<unknown>> =>
    apiClient.request<unknown>({
      path: '/twilio/connect',
      method: 'POST',
      data: payload,
    }),
  getDetails: (id: number): Promise<ApiResult<unknown>> =>
    apiClient.request<unknown>({
      path: `/twilio/${id}`,
      method: 'GET',
    }),
  update: (id: number, payload: Record<string, unknown>): Promise<ApiResult<unknown>> =>
    apiClient.request<unknown>({
      path: `/twilio/${id}`,
      method: 'PATCH',
      data: payload,
    }),
  disconnect: (id: number): Promise<ApiResult<unknown>> =>
    apiClient.request<unknown>({
      path: `/twilio/${id}`,
      method: 'DELETE',
    }),
}
