import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { makeInitialFormCopy } from '@shared-domain'

import { secondsToMinutes } from '../../domain/facilityForm.domain'
import { useFacilityByClientId } from '../../hooks/useFacilitySelectors'
import type { Facility } from '../../types/facility'

import { useFacilityFormContextValue } from './FacilityForm.context'
import type { FacilityFormPayload, FacilityFormState } from './FacilityForm.types'
import { useFacilityFormWarnings } from './FacilityForm.warnings'
import { useFacilityFormValidation } from './FacilityForm.validation'
import { useFacilityFormSubmit } from './useFacilityFormSubmit'

const toJsonValue = (value: unknown) => (value == null ? '' : JSON.stringify(value, null, 2))
const toNullableNumber = (value: number | null | undefined) =>
  value === null || value === undefined ? null : value

const buildInitialForm = (facility?: Facility): FacilityFormState => ({
  name: facility?.name ?? '',
  facility_type: facility?.facility_type ?? '',
  property_location: (facility?.property_location as FacilityFormState['property_location']) ?? null,
  can_dispatch: facility?.can_dispatch ?? false,
  can_receive_returns: facility?.can_receive_returns ?? false,
  operating_hours_json: toJsonValue(facility?.operating_hours ?? null),
  default_loading_time_minutes: secondsToMinutes(facility?.default_loading_time_seconds),
  default_unloading_time_minutes: secondsToMinutes(facility?.default_unloading_time_seconds),
  max_orders_per_day: toNullableNumber(facility?.max_orders_per_day),
  external_refs_json: toJsonValue(facility?.external_refs ?? null),
})

export const FacilityFormProvider = ({
  children,
  payload,
}: {
  children: ReactNode
  payload: FacilityFormPayload
}) => {
  const existing = useFacilityByClientId(payload.clientId ?? null)
  const [formState, setFormState] = useState<FacilityFormState>(() => buildInitialForm(existing ?? undefined))
  const initialFormRef = useRef<FacilityFormState | null>(null)
  const warnings = useFacilityFormWarnings()
  const FacilityFormContext = useFacilityFormContextValue()

  useEffect(() => {
    const initial = buildInitialForm(existing ?? undefined)
    setFormState(initial)
    makeInitialFormCopy(initialFormRef, initial)
  }, [existing, payload])

  const { validateForm } = useFacilityFormValidation({ formState, warnings })
  const submitters = useFacilityFormSubmit({
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

  return <FacilityFormContext.Provider value={value}>{children}</FacilityFormContext.Provider>
}
