import type { LocalDeliveryPlanSettingsPayload } from '@/features/local-delivery-orders/api/localDeliveryPlanSettings.api'
import type { LocalDeliveryEditFormState } from '@/features/local-delivery-orders/forms/localDeliveryEditForm/LocalDeliveryEditForm.types'
import { serviceTimeMinutesToSeconds } from '@/features/local-delivery-orders/domain/serviceTimeUnits'

export const normalizeLocalDeliveryEditFormToSettingsPayload = (
  formState: LocalDeliveryEditFormState,
): LocalDeliveryPlanSettingsPayload => ({
  route_group_id: formState.route_group_id ?? 0,
  delivery_plan: {
    id: formState.delivery_plan.id,
    label: formState.delivery_plan.label,
    start_date: formState.delivery_plan.start_date,
    end_date: formState.delivery_plan.end_date,
  },
  local_delivery_plan: {
    driver_id: formState.route_solution.driver_id,
  },
  route_solution: {
    id: formState.route_solution.id,
    set_start_time: formState.route_solution.set_start_time,
    set_end_time: formState.route_solution.set_end_time,
    eta_tolerance_minutes: formState.route_solution.eta_tolerance_minutes,
    stops_service_time: serviceTimeMinutesToSeconds(formState.route_solution.stops_service_time),
    start_location: formState.route_solution.start_location,
    end_location: formState.route_solution.end_location,
    route_end_strategy: formState.route_solution.route_end_strategy,
    driver_id: formState.route_solution.driver_id,
    vehicle_id: formState.route_solution.vehicle_id,
  },
  create_variant_on_save: formState.create_variant_on_save,
})
