import {
  LOCAL_DELIVERY_DEFAULT_END_TIME,
  LOCAL_DELIVERY_DEFAULT_ROUTE_END_STRATEGY,
  LOCAL_DELIVERY_DEFAULT_START_TIME,
  PLAN_DEFAULT_DRIVER_ID_KEY,
  PLAN_DEFAULT_ETA_TOLERANCE_SECONDS_KEY,
  PLAN_DEFAULT_END_LOCATION_KEY,
  PLAN_DEFAULT_ROUTE_END_STRATEGY_KEY,
  PLAN_DEFAULT_SET_END_TIME_KEY,
  PLAN_DEFAULT_SET_START_TIME_KEY,
  PLAN_DEFAULT_START_LOCATION_KEY,
  PLAN_DEFAULT_STOPS_SERVICE_TIME_KEY,
} from '@/features/plan/constants/planTypeDefaults.constants'
import { loadLocalDeliveryEditFormPreferences } from '@/features/local-delivery-orders/forms/localDeliveryEditForm/localDeliveryEditForm.storage'
import type { LocalDeliveryPlanTypeDefaults } from '@/features/plan/types/plan'
import type { PlanTypeDefaultsContext } from '@/features/plan/domain/planTypeDefaults/planTypeDefaults.types'
import { serviceTimeMinutesToSeconds } from '@/features/local-delivery-orders/domain/serviceTimeUnits'
import { getTeamTimeZone } from '@/shared/utils/teamTimeZone'
import { formatDateOnlyInTimeZone } from '@/shared/utils/formatIsoDate'

export const buildLocalDeliveryPlanTypeDefaults = async (
  ctx: PlanTypeDefaultsContext,
): Promise<LocalDeliveryPlanTypeDefaults> => {
  const stored = loadLocalDeliveryEditFormPreferences()
  const resolvedStartTime = resolveDefaultStartTime(ctx.planStartDate, stored.set_start_time)

  const startLocation = stored.start_location ?? null

  const endLocation = stored.end_location ?? startLocation

  return {
    route_solution: {
      [PLAN_DEFAULT_SET_START_TIME_KEY]: resolvedStartTime,
      [PLAN_DEFAULT_SET_END_TIME_KEY]: stored.set_end_time ?? LOCAL_DELIVERY_DEFAULT_END_TIME,
      [PLAN_DEFAULT_ETA_TOLERANCE_SECONDS_KEY]: (stored.eta_tolerance_minutes ?? 0) * 60,
      [PLAN_DEFAULT_ROUTE_END_STRATEGY_KEY]:
        stored.route_end_strategy ?? LOCAL_DELIVERY_DEFAULT_ROUTE_END_STRATEGY,
      [PLAN_DEFAULT_START_LOCATION_KEY]: startLocation,
      [PLAN_DEFAULT_END_LOCATION_KEY]: endLocation,
      [PLAN_DEFAULT_DRIVER_ID_KEY]: stored.driver_id ?? null,
      [PLAN_DEFAULT_STOPS_SERVICE_TIME_KEY]: serviceTimeMinutesToSeconds(stored.stops_service_time),
    },
  }
}

const resolveDefaultStartTime = (
  planStartDate: string | Date | null | undefined,
  storedStartTime: string | null,
) => {
  if (isPlanStartToday(planStartDate)) {
    return getTeamNowPlusFifteenMinutes()
  }
  return storedStartTime ?? LOCAL_DELIVERY_DEFAULT_START_TIME
}

const isPlanStartToday = (planStartDate: string | Date | null | undefined) => {
  if (!planStartDate) {
    return false
  }

  const parsed = planStartDate instanceof Date ? planStartDate : new Date(planStartDate)
  if (Number.isNaN(parsed.getTime())) {
    return false
  }

  const timeZone = getTeamTimeZone()
  return formatDateOnlyInTimeZone(parsed, timeZone) === formatDateOnlyInTimeZone(new Date(), timeZone)
}

const getTeamNowPlusFifteenMinutes = () => {
  const timeZone = getTeamTimeZone()
  const futureTime = new Date(Date.now() + 15 * 60_000)
  return formatTimeInTimeZone(futureTime, timeZone)
}

const formatTimeInTimeZone = (value: Date, timeZone: string) => {
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(value)

  const hour = parts.find((part) => part.type === 'hour')?.value
  const minute = parts.find((part) => part.type === 'minute')?.value

  if (!hour || !minute) {
    return LOCAL_DELIVERY_DEFAULT_START_TIME
  }

  return `${hour}:${minute}`
}
