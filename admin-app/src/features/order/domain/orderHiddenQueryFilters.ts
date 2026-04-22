import type { OrderQueryFilters } from "../types/orderMeta";

export const HIDDEN_ORDER_QUERY_FILTERS: OrderQueryFilters = {
  plan_type: ["local_delivery", "international_shipping"],
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
