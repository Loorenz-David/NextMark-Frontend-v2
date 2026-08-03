import { buildClientId } from "@/lib/utils/clientId";
import { formatIsoDateFriendly } from "@/shared/utils/formatIsoDate";

import type { DeliveryPlan, RoutePlanObjective } from "@/features/plan/types/plan";
import { DEFAULT_PLAN_TYPE } from "@/features/plan/domain/planType";
import type { CalendarDayKey } from "./planCalendar.domain";

/**
 * Default fields for a plan silently created by dropping an order on an
 * empty calendar day — mirrors the PlanForm bootstrap defaults.
 *
 * The type comes from the dragged orders' objectives, so a shipment dropped on
 * an empty day creates a shipping plan rather than a route plan the order would
 * immediately have to be argued out of.
 */
export const buildCalendarPlanDefaults = (
  dateKey: CalendarDayKey,
  openPlanStateId: number | null,
  planType: RoutePlanObjective = DEFAULT_PLAN_TYPE,
): DeliveryPlan => ({
  client_id: buildClientId("delivery_plan"),
  label: `Plan for ${formatIsoDateFriendly(dateKey)}`,
  plan_type: planType,
  start_date: dateKey,
  end_date: dateKey,
  date_strategy: "single",
  state_id: openPlanStateId ?? null,
});
