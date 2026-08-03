import type { OrderQueryFilters } from "../types/orderMeta";

/**
 * Applied to every order query. `plan_type` here filters on the order's own
 * `order_plan_objective`, so every objective a plan can hand an order must be
 * listed — otherwise orders moved onto a plan of that type vanish from the list
 * they were dragged from.
 */
export const HIDDEN_ORDER_QUERY_FILTERS: OrderQueryFilters = {
  plan_type: ["local_delivery", "international_shipping", "store_pickup"],
};

const HIDDEN_ORDER_QUERY_FILTER_KEYS = new Set<keyof OrderQueryFilters>([
  "plan_type",
]);

export const applyHiddenOrderQueryFilters = (
  filters: Partial<OrderQueryFilters> | undefined,
): OrderQueryFilters => ({
  ...(filters ?? {}),
  ...HIDDEN_ORDER_QUERY_FILTERS,
});

export const stripHiddenOrderQueryFilters = (
  filters: Partial<OrderQueryFilters> | undefined,
): Partial<OrderQueryFilters> =>
  Object.fromEntries(
    Object.entries(filters ?? {}).filter(
      ([key]) => !HIDDEN_ORDER_QUERY_FILTER_KEYS.has(key as keyof OrderQueryFilters),
    ),
  ) as Partial<OrderQueryFilters>;
