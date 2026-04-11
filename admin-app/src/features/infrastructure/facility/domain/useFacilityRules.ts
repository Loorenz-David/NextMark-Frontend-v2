import type { Facility } from '../types/facility'

const matches = (value: string, query: string) =>
  value.toLowerCase().includes(query.toLowerCase())

export const filterFacilities = (items: Facility[], query: string) =>
  query
    ? items.filter((item) =>
      [item.name, item.facility_type, item.client_id]
        .filter(Boolean)
        .some((value) => matches(String(value), query)))
    : items
