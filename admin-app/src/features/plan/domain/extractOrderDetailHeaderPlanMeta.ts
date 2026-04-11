import { coerceUtcFromOffset, toDateOnly } from "@/shared/data-validation/timeValidation";

import { formatRouteTime } from "../routeGroup/utils/formatRouteTime";
import type { RouteSolutionStop } from "../routeGroup/types/routeSolutionStop";
import type { DeliveryPlan } from "../types/plan";

export type OrderDetailHeaderPlanMeta = {
  planLabel: string;
  planDateLabel: string | null;
  arrivalTimeLabel: string | null;
  isUnscheduled: boolean;
};

type ExtractOrderDetailHeaderPlanMetaParams = {
  routePlan: DeliveryPlan | null;
  routeStop: RouteSolutionStop | null;
  fallbackPlanLabel?: string | null;
};

const formatPlanDateRange = (
  startDate?: string | null,
  endDate?: string | null,
): string | null => {
  const start = formatShortPlanDate(startDate ?? null);
  const end = formatShortPlanDate(endDate ?? null);

  if (!start && !end) return null;
  if (!start) return end || null;
  if (!end || start === end) return start;
  return `${start} -- ${end}`;
};

const formatShortPlanDate = (value?: string | null): string | null => {
  const dateOnlyValue = toDateOnly(value ?? null);
  if (!dateOnlyValue) return null;

  const parsed = coerceUtcFromOffset(dateOnlyValue);
  if (!parsed || Number.isNaN(parsed.getTime())) return null;

  return parsed.toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
  });
};

export const extractOrderDetailHeaderPlanMeta = ({
  routePlan,
  routeStop,
  fallbackPlanLabel = null,
}: ExtractOrderDetailHeaderPlanMetaParams): OrderDetailHeaderPlanMeta => {
  if (!routePlan) {
    return {
      planLabel: fallbackPlanLabel ?? "Unscheduled",
      planDateLabel: null,
      arrivalTimeLabel: null,
      isUnscheduled: fallbackPlanLabel == null,
    };
  }

  const arrivalTimeLabel =
    routeStop?.expected_arrival_time &&
    routeStop.expected_arrival_time !== "loading"
      ? formatRouteTime(
          routeStop.expected_arrival_time,
          routePlan.start_date ?? null,
        )
      : null;

  return {
    planLabel: routePlan.label || fallbackPlanLabel || "Unnamed plan",
    planDateLabel: formatPlanDateRange(
      routePlan.start_date ?? null,
      routePlan.end_date ?? null,
    ),
    arrivalTimeLabel,
    isUnscheduled: false,
  };
};
