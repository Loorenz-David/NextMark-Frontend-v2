import { useCallback } from 'react'

import { apiClient } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'

import type { ItemState, ItemStateMap, ItemStatePayload } from '../types/itemState'

export type ItemStateListResponse = {
  item_states: ItemStateMap
}

export type ItemStateDetailResponse = {
  item_state: ItemStateMap | ItemState
}

export const itemStateApi = {
  list: (query?: { include_defaults?: boolean }): Promise<ApiResult<ItemStateListResponse>> =>
    apiClient.request<ItemStateListResponse>({
      path: '/item_states/',
      method: 'GET',
      query,
    }),

  getById: (stateId: number | string): Promise<ApiResult<ItemStateDetailResponse>> =>
    apiClient.request<ItemStateDetailResponse>({
      path: `/item_states/${stateId}`,
      method: 'GET',
    }),

  create: (payload: ItemStatePayload): Promise<ApiResult<Record<string, number>>> =>
    apiClient.request<Record<string, number>>({
      path: '/item_states/',
      method: 'POST',
      data: { fields: payload },
    }),

  update: (targetId: number | string, fields: Partial<ItemStatePayload>): Promise<ApiResult<Record<string, never>>> =>
    apiClient.request<Record<string, never>>({
      path: '/item_states/',
      method: 'PATCH',
      data: { target: { target_id: targetId, fields } },
    }),

  updateIndex: (stateId: number | string, newIndex: number): Promise<ApiResult<Record<string, never>>> =>
    apiClient.request<Record<string, never>>({
      path: `/item_states/${stateId}/index/${newIndex}`,
      method: 'PATCH',
    }),

  remove: (stateId: number | string): Promise<ApiResult<Record<string, never>>> =>
    apiClient.request<Record<string, never>>({
      path: `/item_states/${stateId}`,
      method: 'DELETE',
    }),
}

export const useGetItemStates = () =>
  useCallback((query?: { include_defaults?: boolean }) => itemStateApi.list(query), [])

export const useGetItemState = () =>
  useCallback((stateId: number | string) => itemStateApi.getById(stateId), [])

export const useCreateItemState = () =>
  useCallback((payload: ItemStatePayload) => itemStateApi.create(payload), [])

export const useUpdateItemState = () =>
  useCallback((targetId: number | string, fields: Partial<ItemStatePayload>) =>
    itemStateApi.update(targetId, fields), [])

export const useUpdateItemStateIndex = () =>
  useCallback((stateId: number | string, newIndex: number) =>
    itemStateApi.updateIndex(stateId, newIndex), [])

export const useDeleteItemState = () =>
  useCallback((stateId: number | string) => itemStateApi.remove(stateId), [])
