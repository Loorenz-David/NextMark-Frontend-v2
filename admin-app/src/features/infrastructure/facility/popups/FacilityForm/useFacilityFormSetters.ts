import type { Dispatch, SetStateAction } from 'react'

import type { address } from '@/types/address'

import type { FacilityFormState } from './FacilityForm.types'
import type { FacilityFormWarnings } from './FacilityForm.warnings'

export const useFacilityFormSetters = ({
  setFormState,
  warnings,
}: {
  setFormState: Dispatch<SetStateAction<FacilityFormState>>
  warnings: FacilityFormWarnings
}) => {
  const handleName = (value: string) => {
    warnings.nameWarning.validate(value)
    setFormState((prev) => ({ ...prev, name: value }))
  }

  const handleFacilityType = (value: string) => {
    warnings.facilityTypeWarning.validate(value)
    setFormState((prev) => ({ ...prev, facility_type: value }))
  }

  const handleLocation = (value: address | null) => {
    warnings.locationWarning.validate(value)
    setFormState((prev) => ({ ...prev, property_location: value }))
  }

  const handleCanDispatch = (value: boolean) =>
    setFormState((prev) => ({ ...prev, can_dispatch: value }))

  const handleCanReceiveReturns = (value: boolean) =>
    setFormState((prev) => ({ ...prev, can_receive_returns: value }))

  const handleOperatingHoursJson = (value: string) =>
    setFormState((prev) => ({ ...prev, operating_hours_json: value }))

  const handleDefaultLoadingTimeMinutes = (value: number) =>
    setFormState((prev) => ({ ...prev, default_loading_time_minutes: value }))

  const handleDefaultUnloadingTimeMinutes = (value: number) =>
    setFormState((prev) => ({ ...prev, default_unloading_time_minutes: value }))

  const handleMaxOrdersPerDay = (value: number) =>
    setFormState((prev) => ({ ...prev, max_orders_per_day: value }))

  const handleExternalRefsJson = (value: string) =>
    setFormState((prev) => ({ ...prev, external_refs_json: value }))

  return {
    handleName,
    handleFacilityType,
    handleLocation,
    handleCanDispatch,
    handleCanReceiveReturns,
    handleOperatingHoursJson,
    handleDefaultLoadingTimeMinutes,
    handleDefaultUnloadingTimeMinutes,
    handleMaxOrdersPerDay,
    handleExternalRefsJson,
  }
}
