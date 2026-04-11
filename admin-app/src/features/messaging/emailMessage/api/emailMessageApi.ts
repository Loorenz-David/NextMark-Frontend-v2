import { useCallback } from 'react'

import { apiClient } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'

import type {
  EmailMessageTemplate,
  EmailMessageTemplateMap,
  EmailMessageTemplatePayload,
} from '../types/emailMessage'
import type { EmailTemplatePreviewPayload } from '../types'

export type EmailMessageListResponse = {
  message_templates: EmailMessageTemplateMap | EmailMessageTemplate[]
  message_templates_pagination?: Record<string, unknown>
}

export type EmailMessageDetailResponse = {
  message_template: EmailMessageTemplateMap | EmailMessageTemplate
}

export type EmailTemplatePreviewResponse = {
  html: string
}

export const emailMessageApi = {
  list: (query?: { channel?: 'email'; name?: string; client_id?: string; sort?: string; limit?: number }):
    Promise<ApiResult<EmailMessageListResponse>> =>
    apiClient.request<EmailMessageListResponse>({
      path: '/message_templates/',
      method: 'GET',
      query: { channel: 'email', ...query },
    }),

  getById: (templateId: number | string): Promise<ApiResult<EmailMessageDetailResponse>> =>
    apiClient.request<EmailMessageDetailResponse>({
      path: `/message_templates/${templateId}`,
      method: 'GET',
    }),

  create: (payload: EmailMessageTemplatePayload): Promise<ApiResult<Record<string, number>>> =>
    apiClient.request<Record<string, number>>({
      path: '/message_templates/',
      method: 'PUT',
      data: { fields: payload },
    }),

  update: (targetId: number | string, fields: Partial<EmailMessageTemplatePayload>): Promise<ApiResult<Record<string, never>>> =>
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

  preview: (payload: EmailTemplatePreviewPayload): Promise<ApiResult<EmailTemplatePreviewResponse>> =>
    apiClient.request<EmailTemplatePreviewResponse>({
      path: '/message_templates/preview',
      method: 'POST',
      data: payload,
    }),
}

export const useGetEmailMessages = () =>
  useCallback((query?: { name?: string; client_id?: string; sort?: string; limit?: number }) =>
    emailMessageApi.list(query), [])

export const useGetEmailMessage = () =>
  useCallback((templateId: number | string) => emailMessageApi.getById(templateId), [])

export const useCreateEmailMessage = () =>
  useCallback((payload: EmailMessageTemplatePayload) => emailMessageApi.create(payload), [])

export const useUpdateEmailMessage = () =>
  useCallback((targetId: number | string, fields: Partial<EmailMessageTemplatePayload>) =>
    emailMessageApi.update(targetId, fields), [])

export const useDeleteEmailMessage = () =>
  useCallback((targetId: number | string) => emailMessageApi.remove(targetId), [])

export const usePreviewEmailMessage = () =>
  useCallback((payload: EmailTemplatePreviewPayload) => emailMessageApi.preview(payload), [])
