import { buildClientId } from "@/lib/utils/clientId";
import { formatIsoDateFriendly } from "@/shared/utils/formatIsoDate";

import type { DeliveryPlan } from "@/features/plan/types/plan";
import type { CalendarDayKey } from "./planCalendar.domain";

/**
 * Default fields for a plan silently created by dropping an order on an
 * empty calendar day — mirrors the PlanForm bootstrap defaults.
 */
export const buildCalendarPlanDefaults = (
  dateKey: CalendarDayKey,
  openPlanStateId: number | null,
): DeliveryPlan => ({
  client_id: buildClientId("delivery_plan"),
  label: `Plan for ${formatIsoDateFriendly(dateKey)}`,
  start_date: dateKey,
  end_date: dateKey,
  date_strategy: "single",
  state_id: openPlanStateId ?? null,
});
