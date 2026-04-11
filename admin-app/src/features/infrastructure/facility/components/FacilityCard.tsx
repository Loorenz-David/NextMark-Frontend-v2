import { useMemo, useState } from 'react'

import type { Facility } from '../types/facility'

type FacilityCardProps = {
  facility: Facility
  onEdit: (clientId: string) => void
}

const buildLocationSummary = (location: Record<string, unknown> | null | undefined) => {
  if (!location) return 'No address'
  const { street_address, city, country, postal_code } = location as {
    street_address?: string
    city?: string
    country?: string
    postal_code?: string
  }

  const primary = street_address || [postal_code, city].filter(Boolean).join(' ')
  const secondary = [city, country].filter(Boolean).join(', ')

  if (primary && secondary) return `${primary} · ${secondary}`
  return primary || secondary || 'No address'
}

export const FacilityCard = ({ facility, onEdit }: FacilityCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const locationSummary = useMemo(
    () => buildLocationSummary(facility.property_location ?? null),
    [facility.property_location],
  )
  const subtitle = [
    facility.facility_type ? `Type: ${facility.facility_type}` : null,
    facility.can_dispatch ? 'Dispatch enabled' : null,
  ]
    .filter(Boolean)
    .join(' · ') || locationSummary

  return (
    <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.04] px-5 py-4 shadow-none">
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex min-w-0 flex-1 flex-col text-left"
        >
          <div>
            <p className="text-sm font-semibold text-[var(--color-text)]">{facility.name}</p>
            <p className="text-xs text-[var(--color-muted)]">{subtitle}</p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => onEdit(facility.client_id)}
          className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-xs text-[var(--color-muted)] hover:text-[var(--color-text)]"
        >
          Edit
        </button>
      </div>
      {isExpanded ? (
        <div className="mt-4 grid gap-2 border-t border-white/[0.06] pt-4 text-xs text-[var(--color-muted)]">
          <div>Name: {facility.name}</div>
          <div>Facility type: {facility.facility_type}</div>
          <div>Location: {locationSummary}</div>
          <div>Can dispatch: {facility.can_dispatch ? 'Yes' : 'No'}</div>
          <div>Can receive returns: {facility.can_receive_returns ? 'Yes' : 'No'}</div>
          <div>Default loading time (s): {facility.default_loading_time_seconds ?? '—'}</div>
          <div>Default unloading time (s): {facility.default_unloading_time_seconds ?? '—'}</div>
          <div>Max orders / day: {facility.max_orders_per_day ?? '—'}</div>
        </div>
      ) : null}
    </div>
  )
}
