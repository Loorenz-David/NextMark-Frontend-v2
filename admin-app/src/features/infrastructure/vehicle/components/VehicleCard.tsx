import { useState } from 'react'

import { secondsToMinutes } from '../domain/vehicleForm.domain'
import type { Vehicle } from '../types/vehicle'

type VehicleCardProps = {
  vehicle: Vehicle
  onEdit: (clientId: string) => void
}

const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '—'
  return String(value)
}

const formatBoolean = (value: boolean | null | undefined) => {
  if (value === null || value === undefined) return '—'
  return value ? 'Yes' : 'No'
}

const formatCapabilities = (capabilities: Vehicle['capabilities']) => {
  if (!capabilities?.length) return '—'
  return capabilities.join(', ')
}

export const VehicleCard = ({ vehicle, onEdit }: VehicleCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const displayTitle = vehicle.label?.trim() || vehicle.registration_number
  const subtitle = vehicle.label?.trim()
    ? vehicle.registration_number
    : [
      vehicle.status ? `Status: ${vehicle.status}` : null,
      vehicle.travel_mode ? `Mode: ${vehicle.travel_mode}` : null,
    ]
      .filter(Boolean)
      .join(' · ') || 'Vehicle'

  return (
    <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.04] px-5 py-4 shadow-none">
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex min-w-0 flex-1 flex-col text-left"
        >
        <div>
          <p className="text-sm font-semibold text-[var(--color-text)]">{displayTitle}</p>
          <p className="text-xs text-[var(--color-muted)]">{subtitle}</p>
        </div>
        </button>
        <button
          type="button"
          onClick={() => onEdit(vehicle.client_id)}
          className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-xs text-[var(--color-muted)] hover:text-[var(--color-text)]"
        >
          Edit
        </button>
      </div>
      {isExpanded ? (
        <div className="mt-4 grid gap-2 border-t border-white/[0.06] pt-4 text-xs text-[var(--color-muted)]">
          <div>Registration: {formatValue(vehicle.registration_number)}</div>
          <div>Label: {formatValue(vehicle.label)}</div>
          <div>Fuel type: {formatValue(vehicle.fuel_type)}</div>
          <div>Travel mode: {formatValue(vehicle.travel_mode)}</div>
          <div>Status: {formatValue(vehicle.status)}</div>
          <div>Active: {formatBoolean(vehicle.is_active)}</div>
          <div>Home facility id: {formatValue(vehicle.home_facility_id)}</div>
          <div>Capabilities: {formatCapabilities(vehicle.capabilities)}</div>
          <div>Max volume (cm³): {formatValue(vehicle.max_volume_load_cm3)}</div>
          <div>Max weight (g): {formatValue(vehicle.max_weight_load_g)}</div>
          <div>Max speed (km/h): {formatValue(vehicle.max_speed_kmh)}</div>
          <div>Cost per km: {formatValue(vehicle.cost_per_km)}</div>
          <div>Cost per hour: {formatValue(vehicle.cost_per_hour)}</div>
          <div>Fixed cost: {formatValue(vehicle.fixed_cost)}</div>
          <div>Distance limit (km): {formatValue(vehicle.travel_distance_limit_km)}</div>
          <div>Duration limit (min): {formatValue(vehicle.travel_duration_limit_minutes)}</div>
          <div>Loading time per stop (min): {formatValue(secondsToMinutes(vehicle.loading_time_per_stop_seconds))}</div>
          <div>Unloading time per stop (min): {formatValue(secondsToMinutes(vehicle.unloading_time_per_stop_seconds))}</div>
          <div>System: {vehicle.is_system ? 'Yes' : 'No'}</div>
        </div>
      ) : null}
    </div>
  )
}
