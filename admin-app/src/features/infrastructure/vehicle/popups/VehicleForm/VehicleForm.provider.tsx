import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { makeInitialFormCopy } from '@shared-domain'

import {
  cubicCentimetersToCubicMeters,
  gramsToKilograms,
  secondsToMinutes,
} from '../../domain/vehicleForm.domain'
import { useVehicleByClientId } from '../../hooks/useVehicleSelectors'
import type { Vehicle } from '../../types/vehicle'

import { useVehicleFormContextValue } from './VehicleForm.context'
import type { VehicleFormPayload, VehicleFormState } from './VehicleForm.types'
import { useVehicleFormWarnings } from './VehicleForm.warnings'
import { useVehicleFormValidation } from './VehicleForm.validation'
import { useVehicleFormSubmit } from './useVehicleFormSubmit'

const toNullableNumber = (value: number | null | undefined) =>
  value === null || value === undefined ? null : value

const buildInitialForm = (state?: Vehicle): VehicleFormState => ({
  registration_number: state?.registration_number ?? '',
  label: state?.label ?? '',
  fuel_type: state?.fuel_type ?? '',
  travel_mode: state?.travel_mode ?? '',
  max_volume_load_m3: cubicCentimetersToCubicMeters(state?.max_volume_load_cm3),
  max_weight_load_kg: gramsToKilograms(state?.max_weight_load_g),
  max_speed_kmh: toNullableNumber(state?.max_speed_kmh),
  cost_per_km: toNullableNumber(state?.cost_per_km),
  cost_per_hour: toNullableNumber(state?.cost_per_hour),
  travel_distance_limit_km: toNullableNumber(state?.travel_distance_limit_km),
  travel_duration_limit_minutes: toNullableNumber(state?.travel_duration_limit_minutes),
  home_facility_id: state?.home_facility_id === null || state?.home_facility_id === undefined ? '' : String(state.home_facility_id),
  status: state?.status ?? '',
  is_active: state?.is_active ?? true,
  capabilities_csv: state?.capabilities?.join(', ') ?? '',
  loading_time_per_stop_minutes: secondsToMinutes(state?.loading_time_per_stop_seconds),
  unloading_time_per_stop_minutes: secondsToMinutes(state?.unloading_time_per_stop_seconds),
  fixed_cost: toNullableNumber(state?.fixed_cost),
})

export const VehicleFormProvider = ({
  children,
  payload,
}: {
  children: ReactNode
  payload: VehicleFormPayload
}) => {
  const existing = useVehicleByClientId(payload.clientId ?? null)
  const [formState, setFormState] = useState<VehicleFormState>(() =>
    buildInitialForm(existing ?? undefined),
  )
  const initialFormRef = useRef<VehicleFormState | null>(null)
  const warnings = useVehicleFormWarnings()
  const VehicleFormContext = useVehicleFormContextValue()

  useEffect(() => {
    const initial = buildInitialForm(existing ?? undefined)
    setFormState(initial)
    makeInitialFormCopy(initialFormRef, initial)
  }, [existing, payload])

  const { validateForm } = useVehicleFormValidation({ formState, warnings })
  const submitters = useVehicleFormSubmit({
    payload,
    formState,
    validateForm,
    initialFormRef,
  })

  const value = useMemo(
    () => ({
      payload,
      formState,
      setFormState,
      initialFormRef,
      warnings,
      ...submitters,
    }),
    [formState, payload, submitters, warnings],
  )

  return <VehicleFormContext.Provider value={value}>{children}</VehicleFormContext.Provider>
}
