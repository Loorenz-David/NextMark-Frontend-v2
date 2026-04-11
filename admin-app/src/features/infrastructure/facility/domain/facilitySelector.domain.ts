import type { ObjectLinkSelectorItem } from '@/shared/inputs/ObjectLinkSelector'

import type { Facility } from '../types/facility'

const buildLocationSummary = (location: Record<string, unknown> | null | undefined) => {
  if (!location) return null

  const { street_address, city, country, postal_code } = location as {
    street_address?: string
    city?: string
    country?: string
    postal_code?: string
  }

  const primary = street_address || [postal_code, city].filter(Boolean).join(' ')
  const secondary = [city, country].filter(Boolean).join(', ')

  if (primary && secondary) return `${primary} · ${secondary}`
  return primary || secondary || null
}

export const mapFacilityToSelectorItem = (facility: Facility): ObjectLinkSelectorItem => ({
  id: facility.id ?? facility.client_id,
  label: facility.name,
  details:
    buildLocationSummary((facility.property_location as Record<string, unknown> | null | undefined) ?? null) ??
    facility.facility_type,
})
