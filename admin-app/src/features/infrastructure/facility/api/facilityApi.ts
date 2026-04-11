import { useCallback } from 'react'

import { apiClient } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'

import type { Facility, FacilityInput, FacilityUpdatePayload } from '../types/facility'
import type { FacilityListQuery } from '../domain/facilityQuery.domain'

export type FacilityListResponse = {
  facilities: Facility[]
  facilities_pagination: {
    next_cursor?: string | null
    has_more: boolean
  }
}

export type FacilityDetailResponse = {
  facility: Facility
}

export type FacilityCreateResponse = {
  ids_without_match?: string[]
} & Record<string, number | string[] | undefined>

export type FacilityDeletePayload = {
  target_id?: number | string
  target_ids?: Array<number | string>
}

export const facilityApi = {
  list: (query?: FacilityListQuery, signal?: AbortSignal): Promise<ApiResult<FacilityListResponse>> =>
    apiClient.request<FacilityListResponse>({
      path: '/infrastructures/facilities/',
      method: 'GET',
      query,
      signal,
    }),

  getById: (facilityId: number | string): Promise<ApiResult<FacilityDetailResponse>> =>
    apiClient.request<FacilityDetailResponse>({
      path: `/infrastructures/facilities/${facilityId}`,
      method: 'GET',
    }),

  create: (payload: FacilityInput | FacilityInput[]): Promise<ApiResult<FacilityCreateResponse>> =>
    apiClient.request<FacilityCreateResponse>({
      path: '/infrastructures/facilities/',
      method: 'POST',
      data: { fields: payload },
    }),

  update: (
    payload: FacilityUpdatePayload | FacilityUpdatePayload[],
  ): Promise<ApiResult<Record<string, never>>> =>
    apiClient.request<Record<string, never>>({
      path: '/infrastructures/facilities/',
      method: 'PATCH',
      data: Array.isArray(payload) ? { targets: payload } : { target: payload },
    }),

  remove: (payload: FacilityDeletePayload): Promise<ApiResult<Record<string, never>>> =>
    apiClient.request<Record<string, never>>({
      path: '/infrastructures/facilities/',
      method: 'DELETE',
      data: payload,
    }),
}

export const useGetFacilities = () =>
  useCallback((query?: FacilityListQuery, signal?: AbortSignal) => facilityApi.list(query, signal), [])

export const useGetFacility = () =>
  useCallback((facilityId: number | string) => facilityApi.getById(facilityId), [])

export const useCreateFacility = () =>
  useCallback((payload: FacilityInput | FacilityInput[]) => facilityApi.create(payload), [])

export const useUpdateFacility = () =>
  useCallback((payload: FacilityUpdatePayload | FacilityUpdatePayload[]) => facilityApi.update(payload), [])

export const useDeleteFacility = () =>
  useCallback((payload: FacilityDeletePayload) => facilityApi.remove(payload), [])
