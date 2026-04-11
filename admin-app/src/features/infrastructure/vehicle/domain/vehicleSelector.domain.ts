import type { ObjectLinkSelectorItem } from '@/shared/inputs/ObjectLinkSelector'

import type { Vehicle } from '../types/vehicle'

const buildVehicleDetails = (vehicle: Vehicle) => {
  const parts = [vehicle.registration_number, vehicle.fuel_type, vehicle.status].filter(Boolean)
  return parts.length > 0 ? parts.join(' · ') : null
}

export const mapVehicleToSelectorItem = (vehicle: Vehicle): ObjectLinkSelectorItem => ({
  id: vehicle.id ?? vehicle.client_id,
  label: vehicle.label?.trim() || vehicle.registration_number,
  details: buildVehicleDetails(vehicle),
})
