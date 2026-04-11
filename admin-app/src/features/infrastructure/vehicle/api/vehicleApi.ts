import { useCallback } from 'react'

import { apiClient } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'

import type { Vehicle, VehicleInput, VehicleUpdatePayload } from '../types/vehicle'
import type { VehicleListQuery } from '../domain/vehicleQuery.domain'

export type VehicleConflict = {
  route_solution_id: number
  route_plan_id: number
  route_plan_label: string | null
  start_date: string
  end_date: string
}

export type VehicleAvailabilityResponse = {
  conflicts: VehicleConflict[]
}

export type VehicleListResponse = {
  vehicles: Vehicle[]
  vehicles_pagination: {
    next_cursor?: string | null
    has_more: boolean
  }
}

export type VehicleDetailResponse = {
  vehicle: Vehicle
}

export type VehicleCreateResponse = {
  ids_without_match?: string[]
} & Record<string, number | string[] | undefined>

export type VehicleDeletePayload = {
  target_id?: number | string
  target_ids?: Array<number | string>
}

export const vehicleApi = {
  list: (query?: VehicleListQuery, signal?: AbortSignal): Promise<ApiResult<VehicleListResponse>> =>
    apiClient.request<VehicleListResponse>({
      path: '/infrastructures/vehicles/',
      method: 'GET',
      query,
      signal,
    }),

  getById: (vehicleId: number | string): Promise<ApiResult<VehicleDetailResponse>> =>
    apiClient.request<VehicleDetailResponse>({
      path: `/infrastructures/vehicles/${vehicleId}`,
      method: 'GET',
    }),

  create: (payload: VehicleInput | VehicleInput[]): Promise<ApiResult<VehicleCreateResponse>> =>
    apiClient.request<VehicleCreateResponse>({
      path: '/infrastructures/vehicles/',
      method: 'POST',
      data: { fields: payload },
    }),

  update: (payload: VehicleUpdatePayload | VehicleUpdatePayload[]): Promise<ApiResult<Record<string, never>>> =>
    apiClient.request<Record<string, never>>({
      path: '/infrastructures/vehicles/',
      method: 'PATCH',
      data: Array.isArray(payload) ? { targets: payload } : { target: payload },
    }),

  remove: (payload: VehicleDeletePayload): Promise<ApiResult<Record<string, never>>> =>
    apiClient.request<Record<string, never>>({
      path: '/infrastructures/vehicles/',
      method: 'DELETE',
      data: payload,
    }),

  checkAvailability: (params: {
    vehicleId: number
    startDate: string
    endDate: string
    excludeRouteSolutionId?: number | null
  }): Promise<ApiResult<VehicleAvailabilityResponse>> =>
    apiClient.request<VehicleAvailabilityResponse>({
      path: `/infrastructures/vehicles/${params.vehicleId}/availability`,
      method: 'GET',
      query: {
        start_date: params.startDate,
        end_date: params.endDate,
        ...(params.excludeRouteSolutionId != null
          ? { exclude_route_solution_id: String(params.excludeRouteSolutionId) }
          : {}),
      },
    }),
}

export const useGetVehicles = () =>
  useCallback((query?: VehicleListQuery, signal?: AbortSignal) => vehicleApi.list(query, signal), [])

export const useGetVehicle = () =>
  useCallback((vehicleId: number | string) => vehicleApi.getById(vehicleId), [])

export const useCreateVehicle = () =>
  useCallback((payload: VehicleInput | VehicleInput[]) => vehicleApi.create(payload), [])

export const useUpdateVehicle = () =>
  useCallback((payload: VehicleUpdatePayload | VehicleUpdatePayload[]) => vehicleApi.update(payload), [])

export const useDeleteVehicle = () =>
  useCallback((payload: VehicleDeletePayload) => vehicleApi.remove(payload), [])
