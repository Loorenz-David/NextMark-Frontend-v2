import { normalizeEntityMap } from '@/lib/utils/entities/normalizeEntityMap'

import type { Facility, FacilityMap } from '../types/facility'

const normalizeFacilityArray = (items: Facility[]): FacilityMap => ({
  byClientId: items.reduce<Record<string, Facility>>((accumulator, facility) => {
    accumulator[facility.client_id] = facility
    return accumulator
  }, {}),
  allIds: items.map((facility) => facility.client_id),
})

const isFacility = (value: unknown): value is Facility =>
  typeof value === 'object' && value !== null && 'client_id' in value

export const toFacilityArray = (
  payload: FacilityMap | Facility[] | Facility | null | undefined,
): Facility[] => {
  if (!payload) {
    return []
  }

  if (Array.isArray(payload)) {
    return payload
  }

  if ('client_id' in payload) {
    return [payload]
  }

  if ('byClientId' in payload && 'allIds' in payload) {
    return payload.allIds
      .map((clientId) => payload.byClientId[clientId])
      .filter((facility): facility is Facility => Boolean(facility))
  }

  return Object.values(payload).filter(isFacility)
}

export const normalizeFacilities = (
  payload: FacilityMap | Facility[] | Facility | null | undefined,
) => {
  if (Array.isArray(payload)) {
    return normalizeFacilityArray(payload)
  }

  return normalizeEntityMap<Facility>(payload ?? null)
}
