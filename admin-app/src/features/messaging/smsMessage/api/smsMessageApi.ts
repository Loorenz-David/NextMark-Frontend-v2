import { useCallback } from 'react'

import { apiClient } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'

import type { SmsMessageTemplate, SmsMessageTemplateMap, SmsMessageTemplatePayload } from '../types/smsMessage'

export type SmsMessageListResponse = {
  message_templates: SmsMessageTemplateMap | SmsMessageTemplate[]
  message_templates_pagination?: Record<string, unknown>
}

export type SmsMessageDetailResponse = {
  message_template: SmsMessageTemplateMap | SmsMessageTemplate
}

export const smsMessageApi = {
  list: (query?: { channel?: 'sms'; name?: string; client_id?: string; sort?: string; limit?: number }):
    Promise<ApiResult<SmsMessageListResponse>> =>
    apiClient.request<SmsMessageListResponse>({
      path: '/message_templates/',
      method: 'GET',
      query: { channel: 'sms', ...query },
    }),

  getById: (templateId: number | string): Promise<ApiResult<SmsMessageDetailResponse>> =>
    apiClient.request<SmsMessageDetailResponse>({
      path: `/message_templates/${templateId}`,
      method: 'GET',
    }),

  create: (payload: SmsMessageTemplatePayload): Promise<ApiResult<Record<string, number>>> =>
    apiClient.request<Record<string, number>>({
      path: '/message_templates/',
      method: 'PUT',
      data: { fields: payload },
    }),

  update: (targetId: number | string, fields: Partial<SmsMessageTemplatePayload>): Promise<ApiResult<Record<string, never>>> =>
    apiClient.request<Record<string, never>>({
      path: '/message_templates/',
      method: 'PATCH',
      data: { target: { target_id: targetId, fields } },
    }),

  remove: (targetId: number | string): Promise<ApiResult<Record<string, never>>> =>
    apiClient.request<Record<string, never>>({
      path: '/message_templates/',
      method: 'DELETE',
      data: { target_id: targetId },
    }),
}

export const useGetSmsMessages = () =>
  useCallback((query?: { name?: string; client_id?: string; sort?: string; limit?: number }) =>
    smsMessageApi.list(query), [])

export const useGetSmsMessage = () =>
  useCallback((templateId: number | string) => smsMessageApi.getById(templateId), [])

export const useCreateSmsMessage = () =>
  useCallback((payload: SmsMessageTemplatePayload) => smsMessageApi.create(payload), [])

export const useUpdateSmsMessage = () =>
  useCallback((targetId: number | string, fields: Partial<SmsMessageTemplatePayload>) =>
    smsMessageApi.update(targetId, fields), [])

export const useDeleteSmsMessage = () =>
  useCallback((targetId: number | string) => smsMessageApi.remove(targetId), [])
