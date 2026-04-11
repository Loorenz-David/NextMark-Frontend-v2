import { useCallback } from 'react'

import { apiClient } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'

import type { ItemPosition, ItemPositionMap, ItemPositionPayload } from '../types/itemPosition'

export type ItemPositionListResponse = {
  item_positions: ItemPositionMap
}

export type ItemPositionDetailResponse = {
  item_position: ItemPositionMap | ItemPosition
}

export const itemPositionApi = {
  list: (): Promise<ApiResult<ItemPositionListResponse>> =>
    apiClient.request<ItemPositionListResponse>({
      path: '/item_positions/',
      method: 'GET',
    }),

  getById: (positionId: number | string): Promise<ApiResult<ItemPositionDetailResponse>> =>
    apiClient.request<ItemPositionDetailResponse>({
      path: `/item_positions/${positionId}`,
      method: 'GET',
    }),

  create: (payload: ItemPositionPayload): Promise<ApiResult<Record<string, number>>> =>
    apiClient.request<Record<string, number>>({
      path: '/item_positions/',
      method: 'POST',
      data: { fields: payload },
    }),

  update: (target_id: number | string, fields: Partial<ItemPositionPayload>): Promise<ApiResult<Record<string, never>>> =>
    apiClient.request<Record<string, never>>({
      path: '/item_positions/',
      method: 'PATCH',
      data: { target_id, fields },
    }),

  remove: (positionId: number | string): Promise<ApiResult<Record<string, never>>> =>
    apiClient.request<Record<string, never>>({
      path: `/item_positions/${positionId}`,
      method: 'DELETE',
    }),
}

export const useGetItemPositions = () => useCallback(() => itemPositionApi.list(), [])

export const useGetItemPosition = () =>
  useCallback((positionId: number | string) => itemPositionApi.getById(positionId), [])

export const useCreateItemPosition = () =>
  useCallback((payload: ItemPositionPayload) => itemPositionApi.create(payload), [])

export const useUpdateItemPosition = () =>
  useCallback((target_id: number | string, fields: Partial<ItemPositionPayload>) =>
    itemPositionApi.update(target_id, fields), [])

export const useDeleteItemPosition = () =>
  useCallback((positionId: number | string) => itemPositionApi.remove(positionId), [])
