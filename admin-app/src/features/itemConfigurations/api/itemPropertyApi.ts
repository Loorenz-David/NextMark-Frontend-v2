import { useCallback } from 'react'

import { apiClient } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'

import type { ItemProperty, ItemPropertyMap, ItemPropertyPayload } from '../types/itemProperty'

export type ItemPropertyListResponse = {
  item_properties: ItemPropertyMap
}

export type ItemPropertyDetailResponse = {
  item_property: ItemPropertyMap | ItemProperty
}

export const itemPropertyApi = {
  list: (): Promise<ApiResult<ItemPropertyListResponse>> =>
    apiClient.request<ItemPropertyListResponse>({
      path: '/item_properties/',
      method: 'GET',
    }),

  getById: (propertyId: number | string): Promise<ApiResult<ItemPropertyDetailResponse>> =>
    apiClient.request<ItemPropertyDetailResponse>({
      path: `/item_properties/${propertyId}`,
      method: 'GET',
    }),

  create: (payload: ItemPropertyPayload): Promise<ApiResult<Record<string, number>>> =>
    apiClient.request<Record<string, number>>({
      path: '/item_properties/',
      method: 'POST',
      data: { fields: payload },
    }),

  update: (targetId: number | string, fields: Partial<ItemPropertyPayload>): Promise<ApiResult<Record<string, never>>> =>
    apiClient.request<Record<string, never>>({
      path: '/item_properties/',
      method: 'PATCH',
      data: { target: { target_id: targetId, fields } },
    }),

  remove: (propertyId: number | string): Promise<ApiResult<Record<string, never>>> =>
    apiClient.request<Record<string, never>>({
      path: `/item_properties/${propertyId}`,
      method: 'DELETE',
    }),
}

export const useGetItemProperties = () => useCallback(() => itemPropertyApi.list(), [])

export const useGetItemProperty = () =>
  useCallback((propertyId: number | string) => itemPropertyApi.getById(propertyId), [])

export const useCreateItemProperty = () =>
  useCallback((payload: ItemPropertyPayload) => itemPropertyApi.create(payload), [])

export const useUpdateItemProperty = () =>
  useCallback((targetId: number | string, fields: Partial<ItemPropertyPayload>) =>
    itemPropertyApi.update(targetId, fields), [])

export const useDeleteItemProperty = () =>
  useCallback((propertyId: number | string) => itemPropertyApi.remove(propertyId), [])
