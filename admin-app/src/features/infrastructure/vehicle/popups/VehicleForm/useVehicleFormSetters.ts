import type { Dispatch, SetStateAction } from 'react'

import type { VehicleFormState } from './VehicleForm.types'
import type { VehicleFormWarnings } from './VehicleForm.warnings'

export const useVehicleFormSetters = ({
  setFormState,
  warnings,
}: {
  setFormState: Dispatch<SetStateAction<VehicleFormState>>
  warnings: VehicleFormWarnings
}) => {
  const handleRegistrationNumber = (value: string) => {
    warnings.registrationNumberWarning.validate(value)
    setFormState((prev) => ({ ...prev, registration_number: value }))
  }
  const handleLabel = (value: string) => setFormState((prev) => ({ ...prev, label: value }))
  const handleFuelType = (value: string) => setFormState((prev) => ({ ...prev, fuel_type: value }))
  const handleTravelMode = (value: string) => setFormState((prev) => ({ ...prev, travel_mode: value }))
  const handleMaxVolumeLoadM3 = (value: number) => setFormState((prev) => ({ ...prev, max_volume_load_m3: value }))
  const handleMaxWeightLoadKg = (value: number) => setFormState((prev) => ({ ...prev, max_weight_load_kg: value }))
  const handleMaxSpeedKmh = (value: number) => setFormState((prev) => ({ ...prev, max_speed_kmh: value }))
  const handleCostPerKm = (value: number) => setFormState((prev) => ({ ...prev, cost_per_km: value }))
  const handleCostPerHour = (value: number) => setFormState((prev) => ({ ...prev, cost_per_hour: value }))
  const handleTravelDistanceLimitKm = (value: number) => setFormState((prev) => ({ ...prev, travel_distance_limit_km: value }))
  const handleTravelDurationLimitMinutes = (value: number) => setFormState((prev) => ({ ...prev, travel_duration_limit_minutes: value }))
  const handleHomeFacilityId = (value: string) => setFormState((prev) => ({ ...prev, home_facility_id: value }))
  const handleStatus = (value: string) => setFormState((prev) => ({ ...prev, status: value }))
  const handleIsActive = (value: boolean) => setFormState((prev) => ({ ...prev, is_active: value }))
  const handleCapabilitiesCsv = (value: string) => setFormState((prev) => ({ ...prev, capabilities_csv: value }))
  const handleLoadingTimePerStopMinutes = (value: number) => setFormState((prev) => ({ ...prev, loading_time_per_stop_minutes: value }))
  const handleUnloadingTimePerStopMinutes = (value: number) => setFormState((prev) => ({ ...prev, unloading_time_per_stop_minutes: value }))
  const handleFixedCost = (value: number) => setFormState((prev) => ({ ...prev, fixed_cost: value }))

  return {
    handleRegistrationNumber,
    handleLabel,
    handleFuelType,
    handleTravelMode,
    handleMaxVolumeLoadM3,
    handleMaxWeightLoadKg,
    handleMaxSpeedKmh,
    handleCostPerKm,
    handleCostPerHour,
    handleTravelDistanceLimitKm,
    handleTravelDurationLimitMinutes,
    handleHomeFacilityId,
    handleStatus,
    handleIsActive,
    handleCapabilitiesCsv,
    handleLoadingTimePerStopMinutes,
    handleUnloadingTimePerStopMinutes,
    handleFixedCost,
  }
}
