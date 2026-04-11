import type { VehicleFuelType, VehicleStatus, VehicleTravelMode } from '../types/vehicle'
import type { Vehicle } from '../types/vehicle'

export const VEHICLE_QUERY_SEARCHABLE_COLUMNS = [
  'registration_number',
  'label',
  'client_id',
  'fuel_type',
] as const

export type VehicleQuerySearchColumn = (typeof VEHICLE_QUERY_SEARCHABLE_COLUMNS)[number]

export type VehicleQueryFilters = {
  client_id?: string
  travel_mode?: VehicleTravelMode | null
  fuel_type?: VehicleFuelType | null
  status?: VehicleStatus | null
  is_active?: boolean
  home_facility_id?: number | null
  sort?: string
}

export type VehicleListQuery = {
  q?: string
  s?: string
  client_id?: string
  travel_mode?: VehicleTravelMode
  fuel_type?: VehicleFuelType
  status?: VehicleStatus
  is_active?: boolean
  home_facility_id?: number
  sort?: string
  limit?: number
  cursor?: string
}

export type VehicleSearchResult = {
  vehicles: Vehicle[]
  source: 'initial' | 'remote' | 'fallback'
}

export const buildVehicleSearchQuery = ({
  input,
  limit,
  selectedColumns = [],
  filters = {},
  cursor,
}: {
  input: string
  limit: number
  selectedColumns?: VehicleQuerySearchColumn[]
  filters?: VehicleQueryFilters
  cursor?: string
}): VehicleListQuery => {
  const trimmedInput = input.trim()
  const sanitizedColumns = selectedColumns.filter((column) =>
    VEHICLE_QUERY_SEARCHABLE_COLUMNS.includes(column),
  )

  return {
    ...(trimmedInput ? { q: trimmedInput } : {}),
    ...(sanitizedColumns.length > 0 ? { s: sanitizedColumns.join(',') } : {}),
    ...(filters.client_id?.trim() ? { client_id: filters.client_id.trim() } : {}),
    ...(filters.travel_mode ? { travel_mode: filters.travel_mode } : {}),
    ...(filters.fuel_type ? { fuel_type: filters.fuel_type } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(typeof filters.is_active === 'boolean' ? { is_active: filters.is_active } : {}),
    ...(typeof filters.home_facility_id === 'number' ? { home_facility_id: filters.home_facility_id } : {}),
    ...(filters.sort?.trim() ? { sort: filters.sort.trim() } : {}),
    limit,
    ...(cursor ? { cursor } : {}),
  }
}

export const shouldRunVehicleSearch = (input: string, filters: VehicleQueryFilters = {}) =>
  input.trim().length > 0 ||
  Boolean(filters.client_id?.trim()) ||
  Boolean(filters.travel_mode) ||
  Boolean(filters.fuel_type) ||
  Boolean(filters.status) ||
  typeof filters.is_active === 'boolean' ||
  typeof filters.home_facility_id === 'number'

const matchesValue = (value: string | undefined | null, query: string) =>
  value?.toLowerCase().includes(query.toLowerCase()) ?? false

const matchesColumns = (
  vehicle: Vehicle,
  input: string,
  selectedColumns: VehicleQuerySearchColumn[],
) => {
  const trimmedInput = input.trim()
  if (!trimmedInput) {
    return true
  }

  const columns = selectedColumns.length > 0 ? selectedColumns : VEHICLE_QUERY_SEARCHABLE_COLUMNS
  return columns.some((column) => matchesValue(String(vehicle[column] ?? ''), trimmedInput))
}

const matchesFilters = (vehicle: Vehicle, filters: VehicleQueryFilters) => {
  if (filters.client_id?.trim() && vehicle.client_id !== filters.client_id.trim()) {
    return false
  }

  if (filters.travel_mode && vehicle.travel_mode !== filters.travel_mode) {
    return false
  }

  if (filters.fuel_type && vehicle.fuel_type !== filters.fuel_type) {
    return false
  }

  if (filters.status && vehicle.status !== filters.status) {
    return false
  }

  if (typeof filters.is_active === 'boolean' && Boolean(vehicle.is_active) !== filters.is_active) {
    return false
  }

  if (
    typeof filters.home_facility_id === 'number' &&
    vehicle.home_facility_id !== filters.home_facility_id
  ) {
    return false
  }

  return true
}

export const buildFallbackVehicleSearchResult = ({
  vehicles,
  input,
  limit,
  selectedColumns = [],
  filters = {},
}: {
  vehicles: Vehicle[]
  input: string
  limit: number
  selectedColumns?: VehicleQuerySearchColumn[]
  filters?: VehicleQueryFilters
}): VehicleSearchResult => ({
  vehicles: vehicles
    .filter((vehicle) => matchesFilters(vehicle, filters))
    .filter((vehicle) => matchesColumns(vehicle, input, selectedColumns))
    .slice(0, Math.max(limit, 0)),
  source: shouldRunVehicleSearch(input, filters) ? 'fallback' : 'initial',
})
