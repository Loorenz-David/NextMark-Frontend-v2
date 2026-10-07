import type { OrderQueryStringQueries } from "../types/orderMeta";

/**
 * Columns the backend text search (`q`) may be restricted to via `s`. The UI
 * no longer exposes the chooser; this set is still what `normalizeQuery`
 * validates against for the list, map markers and select-all snapshot.
 */
export const orderStringFilters = new Set<OrderQueryStringQueries>([
  "order_scalar_id",
  "reference_number",
  "external_source",
  "tracking_number",
  "client_name",
  "client_email",
  "client_address",
  "client_phone",
  "plan_label",
  "plan_type",
  "article_number",
  "item_type",
]);
