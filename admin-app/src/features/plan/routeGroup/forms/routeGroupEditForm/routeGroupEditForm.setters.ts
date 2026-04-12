import type { Dispatch, SetStateAction, ChangeEvent } from 'react'
import type { address } from '@/types/address'

import type { RouteGroupEditFormState, RouteGroupEditFormWarnings } from './RouteGroupEditForm.types'
import {
  saveDriverIdPreference,
  saveEtaMessageToleranceMinutesPreference,
  saveEtaToleranceMinutesPreference,
  saveEndLocationPreference,
  saveEndTimePreference,
  saveRouteEndStrategyPreference,
  saveStartLocationPreference,
  saveStartTimePreference,
  saveStopsServiceTimePreference,
  saveVehicleIdPreference,
} from './routeGroupEditForm.storage'

type SetFormState = Dispatch<SetStateAction<RouteGroupEditFormState>>

type Props = {
  setFormState: SetFormState
  formWarnings: RouteGroupEditFormWarnings
  isNoZoneGroup: boolean
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

const parseDateOnlyUtc = (value: string | null | undefined): Date | null => {
  if (!value) return null
  const [yearRaw, monthRaw, dayRaw] = String(value).split('T')[0].split('-')
  const year = Number(yearRaw)
  const month = Number(monthRaw)
  const day = Number(dayRaw)
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null
  }
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null
  }
  return new Date(Date.UTC(year, month - 1, day))
}

const formatDateOnlyUtc = (value: Date): string => value.toISOString().slice(0, 10)

const normalizeRouteEndStrategy = (
  value: string | number,
): 'round_trip' | 'custom_end_address' | 'end_at_last_stop' => {
  const normalized = String(value)
  if (normalized === 'custom_end_address') return 'custom_end_address'
  if (normalized === 'end_at_last_stop') return 'end_at_last_stop'
  return 'round_trip'
}

export const useRouteGroupEditFormSetters = ({
  setFormState,
  formWarnings,
  isNoZoneGroup,
}: Props) => {
  const handlePlanLabel = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setFormState((prev) => ({
      ...prev,
      delivery_plan: { ...prev.delivery_plan, label: value },
    }))
  }

  const handlePlanStartDate = (value: string | null) => {
    if ( !value ) return
    setFormState((prev) => {
      let nextEndDate = prev.delivery_plan.end_date
      const previousStartDate = parseDateOnlyUtc(prev.delivery_plan.start_date)
      const previousEndDate = parseDateOnlyUtc(prev.delivery_plan.end_date)
      const nextStartDate = parseDateOnlyUtc(value)

      // Preserve the existing day-span whenever the start date moves.
      if (previousStartDate && previousEndDate && nextStartDate) {
        const deltaDays = Math.round(
          (nextStartDate.getTime() - previousStartDate.getTime()) / MS_PER_DAY,
        )
        const shiftedEndDate = new Date(previousEndDate.getTime() + (deltaDays * MS_PER_DAY))
        nextEndDate = formatDateOnlyUtc(shiftedEndDate)
      } else if (!prev.delivery_plan.end_date) {
        nextEndDate = value
      }

      const next = {
        ...prev,
        delivery_plan: { ...prev.delivery_plan, start_date: value, end_date: nextEndDate },
      }
      formWarnings.planDateWarning.validate({
        start_date: value,
        end_date: nextEndDate,
      })
      formWarnings.routeStartTimeWarning.validate({
        start_date: value,
        start_time: prev.route_solution.set_start_time,
      })
      formWarnings.routeEndTimeWarning.validate({
        start_date: value,
        end_date: nextEndDate,
        start_time: prev.route_solution.set_start_time,
        end_time: prev.route_solution.set_end_time,
      })
      return next
    })
  }

  const handlePlanEndDate = (value: string | null) => {
    if ( !value ) return
    setFormState((prev) => {
      const next = {
        ...prev,
        delivery_plan: { ...prev.delivery_plan, end_date: value },
      }
      formWarnings.planDateWarning.validate({
        start_date: prev.delivery_plan.start_date,
        end_date: value,
      })
      formWarnings.routeStartTimeWarning.validate({
        start_date: prev.delivery_plan.start_date,
        start_time: prev.route_solution.set_start_time,
      })
      formWarnings.routeEndTimeWarning.validate({
        start_date: prev.delivery_plan.start_date,
        end_date: value,
        start_time: prev.route_solution.set_start_time,
        end_time: prev.route_solution.set_end_time,
      })
      return next
    })
  }

  const handleRouteStartTime = (value: string | null) => {
    if (isNoZoneGroup) saveStartTimePreference(value)
    setFormState((prev) => {
      const next = {
        ...prev,
        route_solution: { ...prev.route_solution, set_start_time: value },
      }
      formWarnings.routeStartTimeWarning.validate({
        start_date: prev.delivery_plan.start_date,
        start_time: value,
      })
      formWarnings.routeEndTimeWarning.validate({
        start_date: prev.delivery_plan.start_date,
        end_date: prev.delivery_plan.end_date,
        start_time: value,
        end_time: prev.route_solution.set_end_time,
      })
      return next
    })
  }

  const handleRouteEndTime = (value: string | null) => {
    if (isNoZoneGroup) saveEndTimePreference(value)
    setFormState((prev) => {
      const next = {
        ...prev,
        route_solution: { ...prev.route_solution, set_end_time: value },
      }
      formWarnings.routeEndTimeWarning.validate({
        start_date: prev.delivery_plan.start_date,
        end_date: prev.delivery_plan.end_date,
        start_time: prev.route_solution.set_start_time,
        end_time: value,
      })
      return next
    })
  }

  const handleEtaToleranceMinutes = (value: number) => {
    const normalized = Math.max(0, Math.min(120, Math.trunc(value)))
    if (isNoZoneGroup) saveEtaToleranceMinutesPreference(normalized)
    setFormState((prev) => ({
      ...prev,
      route_solution: { ...prev.route_solution, eta_tolerance_minutes: normalized },
    }))
  }

  const handleEtaMessageToleranceMinutes = (value: number) => {
    const normalized = Math.max(0, Math.min(120, Math.trunc(value)))
    if (isNoZoneGroup) saveEtaMessageToleranceMinutesPreference(normalized)
    setFormState((prev) => ({
      ...prev,
      route_solution: { ...prev.route_solution, eta_message_tolerance_minutes: normalized },
    }))
  }

  const handleRouteStartLocation = (value: address | null) => {
    if (isNoZoneGroup) saveStartLocationPreference(value)

    setFormState((prev) => ({
      ...prev,
      route_solution: { ...prev.route_solution, start_location: value },
    }))
  }

  const handleRouteEndLocation = (value: address | null) => {
    if (isNoZoneGroup) saveEndLocationPreference(value)
    setFormState((prev) => ({
      ...prev,
      route_solution: { ...prev.route_solution, end_location: value },
    }))
  }

  const handleRouteEndStrategy = (value: string | number) => {
    const normalized = normalizeRouteEndStrategy(value)
    if (isNoZoneGroup) saveRouteEndStrategyPreference(normalized)
    setFormState((prev) => ({
      ...prev,
      route_solution: { ...prev.route_solution, route_end_strategy: normalized },
    }))
  }

  const handleDriverSelection = (value: number | null) => {
    if (isNoZoneGroup) saveDriverIdPreference(value)
    setFormState((prev) => ({
      ...prev,
      route_solution: { ...prev.route_solution, driver_id: value },
    }))
  }

  const handleVehicleSelection = (value: number | null) => {
    if (isNoZoneGroup) saveVehicleIdPreference(value)
    setFormState((prev) => ({
      ...prev,
      route_solution: { ...prev.route_solution, vehicle_id: value },
    }))
  }

  const handleCreateVariantToggle = (value: boolean) => {
    setFormState((prev) => ({
      ...prev,
      create_variant_on_save: value,
    }))
  }

  const handleStopsServiceTimeTime = (value: number) => {
    setFormState((prev) => {
      const current = prev.route_solution.stops_service_time ?? { time: 0, per_item: 0 }
      const nextServiceTime = {
        ...current,
        time: Math.max(0, Math.trunc(value)),
      }
      if (isNoZoneGroup) saveStopsServiceTimePreference(nextServiceTime)
      return {
        ...prev,
        route_solution: { ...prev.route_solution, stops_service_time: nextServiceTime },
      }
    })
  }

  const handleStopsServiceTimePerItem = (value: number) => {
    setFormState((prev) => {
      const current = prev.route_solution.stops_service_time ?? { time: 0, per_item: 0 }
      const nextServiceTime = {
        ...current,
        per_item: Math.max(0, Math.trunc(value)),
      }
      if (isNoZoneGroup) saveStopsServiceTimePreference(nextServiceTime)
      return {
        ...prev,
        route_solution: { ...prev.route_solution, stops_service_time: nextServiceTime },
      }
    })
  }

  return {
    handlePlanLabel,
    handlePlanStartDate,
    handlePlanEndDate,
    handleRouteStartTime,
    handleRouteEndTime,
    handleEtaToleranceMinutes,
    handleEtaMessageToleranceMinutes,
    handleRouteStartLocation,
    handleRouteEndLocation,
    handleRouteEndStrategy,
    handleDriverSelection,
    handleVehicleSelection,
    handleCreateVariantToggle,
    handleStopsServiceTimeTime,
    handleStopsServiceTimePerItem,
  }
}
