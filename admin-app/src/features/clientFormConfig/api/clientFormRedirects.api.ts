import { useCallback } from 'react'

import { apiClient } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'

import type {
  ClientFormRedirectCreateFields,
  ClientFormRedirectMap,
  ClientFormRedirectUpdateFields,
} from '../types/clientFormRedirect'
import type { ClientFormCreateResponse } from './clientFormCreateResponse'

const BASE_PATH = '/client_form_config/redirects'

export type ClientFormRedirectListResponse = {
  client_form_redirects: ClientFormRedirectMap
}

export type ClientFormRedirectActivateResponse = {
  active_id: number | null
}

export const clientFormRedirectsApi = {
  list: (): Promise<ApiResult<ClientFormRedirectListResponse>> =>
    apiClient.request<ClientFormRedirectListResponse>({
      path: BASE_PATH,
      method: 'GET',
    }),

  create: (
    fields: ClientFormRedirectCreateFields,
  ): Promise<ApiResult<ClientFormCreateResponse>> =>
    apiClient.request<ClientFormCreateResponse>({
      path: BASE_PATH,
      method: 'PUT',
      data: { fields },
    }),

  /** `target_id` must be the numeric server id — string ids raise a 510 backend-wide. */
  update: (
    targetId: number,
    fields: ClientFormRedirectUpdateFields,
  ): Promise<ApiResult<Record<string, never>>> =>
    apiClient.request<Record<string, never>>({
      path: BASE_PATH,
      method: 'PATCH',
      data: { target: { target_id: targetId, fields } },
    }),

  remove: (targetIds: number[]): Promise<ApiResult<Record<string, never>>> =>
    apiClient.request<Record<string, never>>({
      path: BASE_PATH,
      method: 'DELETE',
      data: { target_ids: targetIds },
    }),

  /** `null` turns the redirect off; the form then stays on its confirmation. */
  activate: (
    targetId: number | null,
  ): Promise<ApiResult<ClientFormRedirectActivateResponse>> =>
    apiClient.request<ClientFormRedirectActivateResponse>({
      path: `${BASE_PATH}/activate`,
      method: 'POST',
      data: { target_id: targetId },
    }),
}

export const useGetClientFormRedirects = () =>
  useCallback(() => clientFormRedirectsApi.list(), [])

export const useCreateClientFormRedirect = () =>
  useCallback(
    (fields: ClientFormRedirectCreateFields) => clientFormRedirectsApi.create(fields),
    [],
  )

export const useUpdateClientFormRedirect = () =>
  useCallback(
    (targetId: number, fields: ClientFormRedirectUpdateFields) =>
      clientFormRedirectsApi.update(targetId, fields),
    [],
  )

export const useDeleteClientFormRedirect = () =>
  useCallback((targetId: number) => clientFormRedirectsApi.remove([targetId]), [])

export const useActivateClientFormRedirect = () =>
  useCallback((targetId: number | null) => clientFormRedirectsApi.activate(targetId), [])
