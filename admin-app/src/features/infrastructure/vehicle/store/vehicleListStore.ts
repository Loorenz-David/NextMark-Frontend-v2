import type { ListState } from "@shared-store"
import type { VehiclePagination, VehicleQueryFilters } from '@/features/infrastructure/vehicle/types/vehicleMeta'

import { createListStore } from "@shared-store"

export const useVehicleListStore = createListStore<Record<string, never>, VehicleQueryFilters, VehiclePagination>()

export const selectVehicleListPagination = (
  state: ListState<Record<string, never>, VehicleQueryFilters, VehiclePagination>,
) => state.pagination

export const selectVehicleListQuery = (
  state: ListState<Record<string, never>, VehicleQueryFilters, VehiclePagination>,
) => state.query

export const selectVehicleListLoading = (
  state: ListState<Record<string, never>, VehicleQueryFilters, VehiclePagination>,
) => state.isLoading

export const selectVehicleListError = (
  state: ListState<Record<string, never>, VehicleQueryFilters, VehiclePagination>,
) => state.error

export const setVehicleListResult = (payload: {
  queryKey: string
  query?: VehicleQueryFilters
  pagination?: VehiclePagination
}) => useVehicleListStore.getState().setResult(payload)

export const setVehicleListLoading = (loading: boolean) =>
  useVehicleListStore.getState().setLoading(loading)

export const setVehicleListError = (error?: string) =>
  useVehicleListStore.getState().setError(error)

export const clearVehicleList = () =>
  useVehicleListStore.getState().clear()
