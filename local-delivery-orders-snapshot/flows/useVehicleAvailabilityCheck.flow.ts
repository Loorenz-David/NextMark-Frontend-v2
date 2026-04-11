import { useCallback, useEffect, useRef } from 'react'

import { vehicleApi } from '@/features/infrastructure/vehicle/api/vehicleApi'

import type { LocalDeliveryEditFormState } from '../forms/localDeliveryEditForm/LocalDeliveryEditForm.types'
import type { LocalDeliveryEditFormWarnings } from '../forms/localDeliveryEditForm/LocalDeliveryEditForm.types'

const DEBOUNCE_MS = 500

export const useVehicleAvailabilityCheck = ({
  formState,
  formWarnings,
}: {
  formState: LocalDeliveryEditFormState
  formWarnings: LocalDeliveryEditFormWarnings
}) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const checkAvailability = useCallback(async () => {
    const vehicleId = formState.route_solution.vehicle_id
    const startDate = formState.delivery_plan.start_date
    const endDate = formState.delivery_plan.end_date
    const excludeId = formState.route_solution.id ?? null

    if (!vehicleId || !startDate || !endDate) {
      formWarnings.vehicleBusyWarning.hideWarning()
      return
    }

    try {
      const result = await vehicleApi.checkAvailability({
        vehicleId,
        startDate,
        endDate,
        excludeRouteSolutionId: excludeId,
      })

      if (!result.data) return

      const conflicts = result.data.conflicts
      if (conflicts.length > 0) {
        const first = conflicts[0]
        const label = first.delivery_plan_label ?? `Plan ${first.delivery_plan_id}`
        const message = `Vehicle is busy by "${label}" on dates ${first.start_date} to ${first.end_date}.`
        formWarnings.vehicleBusyWarning.showWarning(message)
      } else {
        formWarnings.vehicleBusyWarning.hideWarning()
      }
    } catch {
      // silently ignore — don't block save on network error
      formWarnings.vehicleBusyWarning.hideWarning()
    }
  }, [formState, formWarnings])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      void checkAvailability()
    }, DEBOUNCE_MS)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [
    formState.route_solution.vehicle_id,
    formState.delivery_plan.start_date,
    formState.delivery_plan.end_date,
  ])
}
