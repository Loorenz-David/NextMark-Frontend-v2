import { useCallback } from 'react'

import { apiClient } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'

import type { ItemType, ItemTypeMap, ItemTypePayload } from '../types/itemType'

export type ItemTypeListResponse = {
  item_types: ItemTypeMap
}

export type ItemTypeDetailResponse = {
  item_type: ItemTypeMap | ItemType
}

export const itemTypeApi = {
  list: (): Promise<ApiResult<ItemTypeListResponse>> =>
    apiClient.request<ItemTypeListResponse>({
      path: '/item_types/',
      method: 'GET',
    }),

  getById: (typeId: number | string): Promise<ApiResult<ItemTypeDetailResponse>> =>
    apiClient.request<ItemTypeDetailResponse>({
      path: `/item_types/${typeId}`,
      method: 'GET',
    }),

  create: (payload: ItemTypePayload): Promise<ApiResult<Record<string, number>>> =>
    apiClient.request<Record<string, number>>({
      path: '/item_types/',
      method: 'POST',
      data: { fields: payload },
    }),

  update: (targetId: number | string, fields: Partial<ItemTypePayload>): Promise<ApiResult<Record<string, never>>> =>
    apiClient.request<Record<string, never>>({
      path: '/item_types/',
      method: 'PATCH',
      data: { target: { target_id: targetId, fields } },
    }),

  remove: (typeId: number | string): Promise<ApiResult<Record<string, never>>> =>
    apiClient.request<Record<string, never>>({
      path: `/item_types/${typeId}`,
      method: 'DELETE',
    }),
}

export const useGetItemTypes = () => useCallback(() => itemTypeApi.list(), [])

export const useGetItemType = () =>
  useCallback((typeId: number | string) => itemTypeApi.getById(typeId), [])

export const useCreateItemType = () =>
  useCallback((payload: ItemTypePayload) => itemTypeApi.create(payload), [])

export const useUpdateItemType = () =>
  useCallback((targetId: number | string, fields: Partial<ItemTypePayload>) =>
    itemTypeApi.update(targetId, fields), [])

export const useDeleteItemType = () =>
  useCallback((typeId: number | string) => itemTypeApi.remove(typeId), [])
