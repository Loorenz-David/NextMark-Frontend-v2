import type { address, coordinates } from '@/types/address'
import type { RouteSolution } from '@/features/plan/routeGroup/types/routeSolution'
import type { ServiceTime } from '@/features/plan/routeGroup/types/serviceTime'
import type { DeliveryPlan } from '@/features/plan/types/plan'
import { serviceTimeSecondsToMinutes } from '@/features/plan/routeGroup/domain/serviceTimeUnits'

import type { RouteGroupEditFormState } from './RouteGroupEditForm.types'


export const initialRouteGroupEditForm = (): RouteGroupEditFormState => ({
  route_group_id: null,
  delivery_plan: {
    client_id: null,
    label: '',
    start_date: '',
    end_date: '',
  },
  route_solution: {
    client_id: null,
    label: null,
    start_location: null,
    end_location: null,
    set_start_time: '00:00',
    set_end_time: '23:59',
    eta_tolerance_minutes: 0,
    eta_message_tolerance_minutes: 0,
    stops_service_time: null,
    route_end_strategy: 'round_trip',
    driver_id: null,
    vehicle_id: null,
    created_at: null,
    is_optimized: null,
  },
  create_variant_on_save: false,
})

const normalizeTimeValue = (value?: string | null) => {
  if (!value) return null
  const match = value.match(/^(\d{2}:\d{2})/)
  return match ? match[1] : value
}

const coerceAddress = (value: Record<string, unknown> | null | undefined): address | null => {
  if (!value || typeof value !== 'object') return null

  if ('street_address' in value && 'coordinates' in value) {
    return value as address
  }

  if ('raw_address' in value && 'coordinates' in value) {
    const coords = value.coordinates as coordinates | undefined
    if (!coords) return null

    return {
      street_address: value.raw_address as string,
      city: value.city as string | undefined,
      country: value.country as string | undefined,
      postal_code: value.postal_code as string | undefined,
      coordinates: coords,
    }
  }

  return null
}

const coerceServiceTime = (
  value: ServiceTime | Record<string, unknown> | null | undefined,
): ServiceTime | null => {
  if (!value || typeof value !== 'object') return null
  const candidate = value as Record<string, unknown>
  if (
    typeof candidate.time !== 'number'
    || !Number.isInteger(candidate.time)
    || candidate.time < 0
  ) {
    return null
  }
  if (
    typeof candidate.per_item !== 'number'
    || !Number.isInteger(candidate.per_item)
    || candidate.per_item < 0
  ) {
    return null
  }

  return serviceTimeSecondsToMinutes({
    time: candidate.time,
    per_item: candidate.per_item,
  })
}

export const buildFormState = (
  routeGroupId: number,
  plan: DeliveryPlan,
  routeSolution: RouteSolution,
  createVariantOnSave: boolean,
): RouteGroupEditFormState => {


  return {
    route_group_id: routeGroupId,
    delivery_plan: {
      id: plan.id ?? undefined,
      client_id: plan.client_id ?? null,
      label: plan.label ?? '',
      start_date: plan.start_date ?? '',
      end_date: plan.end_date ?? '',
    },
    route_solution: {
      id: routeSolution.id ?? undefined,
      client_id: routeSolution.client_id ?? null,
      label: routeSolution.label ?? null,
      start_location: coerceAddress(routeSolution.start_location as Record<string, unknown> | null) ,
      end_location: coerceAddress(routeSolution.end_location as Record<string, unknown> | null) ,
      set_start_time: normalizeTimeValue(routeSolution.set_start_time) ?? '09:00',
      set_end_time: normalizeTimeValue(routeSolution.set_end_time) ?? '17:00',
      eta_tolerance_minutes: Math.max(0, Math.trunc((routeSolution.eta_tolerance_seconds ?? 0) / 60)),
      eta_message_tolerance_minutes: Math.max(
        0,
        Math.trunc((routeSolution.eta_message_tolerance ?? 0) / 60),
      ),
      stops_service_time: coerceServiceTime(routeSolution.stops_service_time),
      route_end_strategy: routeSolution.route_end_strategy ??  'round_trip',
      driver_id: routeSolution.driver_id ?? null,
      vehicle_id: routeSolution.vehicle_id ?? null,
      created_at: routeSolution.created_at ?? null,
      is_optimized: routeSolution.is_optimized ?? null,
    },
    create_variant_on_save: createVariantOnSave,
  }
}
