import { useCallback } from 'react'

import { apiClient } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'

import type { MediaPlacement } from '../domain/mediaPlacement'
import type {
  ClientFormMediaCreateFields,
  ClientFormMediaMap,
  ClientFormMediaUpdateFields,
} from '../types/clientFormMedia'
import type { ClientFormCreateResponse } from './clientFormCreateResponse'

const BASE_PATH = '/client_form_config/media'

export type ClientFormMediaListResponse = {
  client_form_media: ClientFormMediaMap
}

export const clientFormMediaApi = {
  list: (filters?: {
    placement?: MediaPlacement
    enabled?: boolean
  }): Promise<ApiResult<ClientFormMediaListResponse>> =>
    apiClient.request<ClientFormMediaListResponse>({
      path: BASE_PATH,
      method: 'GET',
      ...(filters?.placement === undefined && filters?.enabled === undefined
        ? {}
        : {
            query: {
              ...(filters?.placement === undefined ? {} : { placement: filters.placement }),
              ...(filters?.enabled === undefined ? {} : { enabled: filters.enabled }),
            },
          }),
    }),

  create: (
    fields: ClientFormMediaCreateFields | ClientFormMediaCreateFields[],
  ): Promise<ApiResult<ClientFormCreateResponse>> =>
    apiClient.request<ClientFormCreateResponse>({
      path: BASE_PATH,
      method: 'PUT',
      data: { fields },
    }),

  /** `target_id` must be the numeric server id — string ids raise a 510 backend-wide. */
  update: (
    targetId: number,
    fields: ClientFormMediaUpdateFields,
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

  /** Scoped to one placement — `ordered_ids` must list every item in it exactly once. */
  reorder: (placement: MediaPlacement, orderedIds: number[]): Promise<ApiResult<number[]>> =>
    apiClient.request<number[]>({
      path: `${BASE_PATH}/reorder`,
      method: 'POST',
      data: { placement, ordered_ids: orderedIds },
    }),
}

export const useGetClientFormMedia = () =>
  useCallback(
    (filters?: { placement?: MediaPlacement; enabled?: boolean }) =>
      clientFormMediaApi.list(filters),
    [],
  )

export const useCreateClientFormMedia = () =>
  useCallback(
    (fields: ClientFormMediaCreateFields | ClientFormMediaCreateFields[]) =>
      clientFormMediaApi.create(fields),
    [],
  )

export const useUpdateClientFormMedia = () =>
  useCallback(
    (targetId: number, fields: ClientFormMediaUpdateFields) =>
      clientFormMediaApi.update(targetId, fields),
    [],
  )

export const useDeleteClientFormMedia = () =>
  useCallback((targetId: number) => clientFormMediaApi.remove([targetId]), [])

export const useReorderClientFormMedia = () =>
  useCallback(
    (placement: MediaPlacement, orderedIds: number[]) =>
      clientFormMediaApi.reorder(placement, orderedIds),
    [],
  )
