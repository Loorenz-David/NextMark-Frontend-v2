import { apiClient } from '@/lib/api/ApiClient'
import type {
  AICreateThreadRequest,
  AIMessageRequest,
  AIThreadCreateResponse,
  AIThreadGetResponse,
  AIThreadMessageResponse,
} from '../types/ai'

// Re-export convenience type
export type { AIThreadMessageResponse }

export const aiApi = {
  createThread: async (payload?: AICreateThreadRequest): Promise<AIThreadCreateResponse> => {
    const response = await apiClient.request<AIThreadCreateResponse>({
      path: '/ai/threads',
      method: 'POST',
      data: payload ?? {},
    })
    return response.data
  },

  sendMessage: async (
    threadId: string,
    payload: AIMessageRequest
  ): Promise<AIThreadMessageResponse> => {
    const response = await apiClient.request<AIThreadMessageResponse>({
      path: `/ai/threads/${threadId}/messages`,
      method: 'POST',
      data: payload,
    })
    return response.data
  },

  getThread: async (threadId: string): Promise<AIThreadGetResponse> => {
    const response = await apiClient.request<AIThreadGetResponse>({
      path: `/ai/threads/${threadId}`,
      method: 'GET',
    })
    return response.data
  },
}
