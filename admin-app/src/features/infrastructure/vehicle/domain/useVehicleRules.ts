import type { Vehicle } from '../types/vehicle'

const matches = (value: string, query: string) =>
  value.toLowerCase().includes(query.toLowerCase())

export const filterVehicles = (items: Vehicle[], query: string) =>
  query
    ? items.filter((item) =>
      [
        item.label,
        item.registration_number,
        item.fuel_type,
        item.status,
        item.client_id,
      ]
        .filter(Boolean)
        .some((value) => matches(String(value), query)))
    : items
