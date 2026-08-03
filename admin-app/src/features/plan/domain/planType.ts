import type { DeliveryPlan, RoutePlanObjective } from "@/features/plan/types/plan";

export const PLAN_TYPES = [
  "local_delivery",
  "international_shipping",
  "store_pickup",
] as const satisfies readonly RoutePlanObjective[];

/**
 * Plans created before the backend added `plan_type` were all route operations
 * plans and were backfilled as such, so an absent value resolves to local delivery.
 */
export const DEFAULT_PLAN_TYPE: RoutePlanObjective = "local_delivery";

export const isPlanType = (value: unknown): value is RoutePlanObjective =>
  typeof value === "string" &&
  (PLAN_TYPES as readonly string[]).includes(value);

export const normalizePlanType = (value: unknown): RoutePlanObjective =>
  isPlanType(value) ? value : DEFAULT_PLAN_TYPE;

export const resolvePlanType = (
  plan: Pick<DeliveryPlan, "plan_type"> | null | undefined,
): RoutePlanObjective => normalizePlanType(plan?.plan_type);

/**
 * Route groups, route solutions, stops, optimization and the route map overlay
 * exist only for local delivery. Guard every one of them with this.
 */
export const isLocalDeliveryPlan = (
  plan: Pick<DeliveryPlan, "plan_type"> | null | undefined,
): boolean => resolvePlanType(plan) === "local_delivery";

export const PLAN_TYPE_LABELS: Record<RoutePlanObjective, string> = {
  local_delivery: "Local delivery",
  international_shipping: "International shipping",
  store_pickup: "Store pickup",
};

/** For chips and other space-constrained surfaces. */
export const PLAN_TYPE_SHORT_LABELS: Record<RoutePlanObjective, string> = {
  local_delivery: "Local",
  international_shipping: "Shipping",
  store_pickup: "Pickup",
};

/** Condensed from PLAN_MAIN_HEADER_INFO so both stay on the same message. */
export const PLAN_TYPE_DESCRIPTIONS: Record<RoutePlanObjective, string> = {
  local_delivery:
    "Optimize routes and manage stop-by-stop execution for same-day or scheduled local deliveries.",
  international_shipping:
    "Group orders handed to a shipment carrier, so carrier progress stays connected to the system.",
  store_pickup:
    "Group orders handled through your own warehouse or store flow instead of delivery-route execution.",
};

export const PLAN_TYPE_OPTIONS: Array<{
  label: string;
  value: RoutePlanObjective;
}> = PLAN_TYPES.map((planType) => ({
  label: PLAN_TYPE_LABELS[planType],
  value: planType,
}));
