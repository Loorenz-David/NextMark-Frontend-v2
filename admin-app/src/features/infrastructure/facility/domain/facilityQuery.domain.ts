import type { FacilityType } from '../../domain/infrastructureEnums'
import type { Facility } from '../types/facility'

export const FACILITY_QUERY_SEARCHABLE_COLUMNS = [
  'name',
  'facility_type',
  'client_id',
  'property_location',
] as const

export type FacilityQuerySearchColumn = (typeof FACILITY_QUERY_SEARCHABLE_COLUMNS)[number]

export type FacilityQueryFilters = {
  client_id?: string
  facility_type?: FacilityType | null
  can_dispatch?: boolean
  can_receive_returns?: boolean
  sort?: string
}

export type FacilityListQuery = {
  q?: string
  s?: string
  client_id?: string
  facility_type?: FacilityType
  can_dispatch?: boolean
  can_receive_returns?: boolean
  sort?: string
  limit?: number
  cursor?: string
}

export type FacilitySearchResult = {
  facilities: Facility[]
  source: 'initial' | 'remote' | 'fallback'
}

export const buildFacilitySearchQuery = ({
  input,
  limit,
  selectedColumns = [],
  filters = {},
  cursor,
}: {
  input: string
  limit: number
  selectedColumns?: FacilityQuerySearchColumn[]
  filters?: FacilityQueryFilters
  cursor?: string
}): FacilityListQuery => {
  const trimmedInput = input.trim()
  const sanitizedColumns = selectedColumns.filter((column) =>
    FACILITY_QUERY_SEARCHABLE_COLUMNS.includes(column),
  )

  return {
    ...(trimmedInput ? { q: trimmedInput } : {}),
    ...(sanitizedColumns.length > 0 ? { s: sanitizedColumns.join(',') } : {}),
    ...(filters.client_id?.trim() ? { client_id: filters.client_id.trim() } : {}),
    ...(filters.facility_type ? { facility_type: filters.facility_type } : {}),
    ...(typeof filters.can_dispatch === 'boolean' ? { can_dispatch: filters.can_dispatch } : {}),
    ...(typeof filters.can_receive_returns === 'boolean'
      ? { can_receive_returns: filters.can_receive_returns }
      : {}),
    ...(filters.sort?.trim() ? { sort: filters.sort.trim() } : {}),
    limit,
    ...(cursor ? { cursor } : {}),
  }
}

export const shouldRunFacilitySearch = (input: string, filters: FacilityQueryFilters = {}) =>
  input.trim().length > 0 ||
  Boolean(filters.client_id?.trim()) ||
  Boolean(filters.facility_type) ||
  typeof filters.can_dispatch === 'boolean' ||
  typeof filters.can_receive_returns === 'boolean'

const matchesValue = (value: string | undefined | null, query: string) =>
  value?.toLowerCase().includes(query.toLowerCase()) ?? false

const getFacilitySearchValue = (
  facility: Facility,
  column: FacilityQuerySearchColumn,
) => {
  if (column !== 'property_location') {
    return String(facility[column] ?? '')
  }

  const location = facility.property_location as Record<string, unknown> | null | undefined
  if (!location) {
    return ''
  }

  return [
    location.street_address,
    location.city,
    location.country,
    location.postal_code,
    location.state,
    location.region,
  ]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .join(' ')
}

const matchesColumns = (
  facility: Facility,
  input: string,
  selectedColumns: FacilityQuerySearchColumn[],
) => {
  const trimmedInput = input.trim()
  if (!trimmedInput) {
    return true
  }

  const columns = selectedColumns.length > 0 ? selectedColumns : FACILITY_QUERY_SEARCHABLE_COLUMNS
  return columns.some((column) => matchesValue(getFacilitySearchValue(facility, column), trimmedInput))
}

const matchesFilters = (facility: Facility, filters: FacilityQueryFilters) => {
  if (filters.client_id?.trim() && facility.client_id !== filters.client_id.trim()) {
    return false
  }

  if (filters.facility_type && facility.facility_type !== filters.facility_type) {
    return false
  }

  if (
    typeof filters.can_dispatch === 'boolean' &&
    Boolean(facility.can_dispatch) !== filters.can_dispatch
  ) {
    return false
  }

  if (
    typeof filters.can_receive_returns === 'boolean' &&
    Boolean(facility.can_receive_returns) !== filters.can_receive_returns
  ) {
    return false
  }

  return true
}

export const buildFallbackFacilitySearchResult = ({
  facilities,
  input,
  limit,
  selectedColumns = [],
  filters = {},
}: {
  facilities: Facility[]
  input: string
  limit: number
  selectedColumns?: FacilityQuerySearchColumn[]
  filters?: FacilityQueryFilters
}): FacilitySearchResult => ({
  facilities: facilities
    .filter((facility) => matchesFilters(facility, filters))
    .filter((facility) => matchesColumns(facility, input, selectedColumns))
    .slice(0, Math.max(limit, 0)),
  source: shouldRunFacilitySearch(input, filters) ? 'fallback' : 'initial',
})
