import type { RouteGroup } from "@/features/plan/routeGroup/types/routeGroup";
import type {
  DeliveryPlan,
  PlanCreateResultBundle,
} from "@/features/plan/types/plan";

export type NormalizedPlanCreateBundle = {
  plan: DeliveryPlan;
  routeGroups: RouteGroup[];
};

/**
 * Absorbs the one shape difference between the three create endpoints:
 * `/route_plans/` returns the created plan under `delivery_plan`, while
 * `/international_shipping_plans/` and `/store_pickup_plans/` return it under
 * `route_plan`.
 *
 * The container endpoints also return their domain child row
 * (`international_shipping_plan` / `store_pickup_plan`). The frontend neither
 * sends nor reads those fields yet, so the key is ignored here rather than
 * carried into the store.
 *
 * Returns null when the bundle holds no plan under either key, so callers can
 * treat a malformed response the same as a failed request.
 */
export const normalizePlanCreateBundle = (
  bundle: PlanCreateResultBundle | null | undefined,
): NormalizedPlanCreateBundle | null => {
  const plan = bundle?.delivery_plan ?? bundle?.route_plan;
  if (!plan?.client_id) {
    return null;
  }

  return {
    plan,
    routeGroups: Array.isArray(bundle?.route_groups) ? bundle.route_groups : [],
  };
};
