import { useRoutePlanStore } from "@/features/plan/store/routePlan.slice";

import { reactiveOrderVisibility } from "../domain/orderReactiveVisibility";
import { appendVisibleOrders, useOrderStore } from "../store/order.store";
import { getQueryFilters } from "../store/orderQuery.store";
import { useOrderStateStore } from "../store/orderState.store";

/**
 * Rebuilds the same lookups `useVisibleOrders` derives, so an order is judged
 * against the list by identical rules whether it arrived from a fetch or from a
 * local mutation.
 */
const buildVisibilityContext = () => {
  const orderStateStore = useOrderStateStore.getState();
  const routePlanStore = useRoutePlanStore.getState();

  const orderStateNameById = Object.entries(orderStateStore.idIndex).reduce<
    Record<number, string>
  >((acc, [id, clientId]) => {
    const numericId = Number(id);
    const state = orderStateStore.byClientId[clientId];
    if (Number.isFinite(numericId) && state?.name) {
      acc[numericId] = state.name;
    }
    return acc;
  }, {});

  const routePlanDateRangeById = Object.entries(routePlanStore.idIndex).reduce<
    Record<number, { startDate: string | null; endDate: string | null }>
  >((acc, [id, clientId]) => {
    const numericId = Number(id);
    const routePlan = routePlanStore.byClientId[clientId];
    if (Number.isFinite(numericId) && routePlan) {
      acc[numericId] = {
        startDate: routePlan.start_date ?? null,
        endDate: routePlan.end_date ?? null,
      };
    }
    return acc;
  }, {});

  return { orderStateNameById, routePlanDateRangeById };
};

/**
 * Adds orders to the list's visible ids when they now satisfy the active query.
 *
 * The list renders `visibleIds` filtered by `reactiveOrderVisibility`, so a
 * mutation can only ever *remove* a row: an order that was excluded by the last
 * fetch has no id in the list to re-evaluate. Unscheduling is the case that
 * matters — the default query shows unscheduled orders, and an order leaving a
 * plan becomes a match while sitting outside the list entirely.
 *
 * Safe to call optimistically. A row that no longer matches is filtered out on
 * render, so a rolled-back mutation leaves an id that simply stays hidden.
 */
export const syncOrdersIntoVisibleList = (clientIds: string[]) => {
  if (clientIds.length === 0) return;

  const { visibleIds, byClientId } = useOrderStore.getState();
  // A null visibleIds means no list query has run yet; the first fetch will
  // build it and there is nothing to keep in sync.
  if (!visibleIds) return;

  const filters = getQueryFilters();
  const context = buildVisibilityContext();
  const alreadyVisible = new Set(visibleIds);

  const idsToAppend = clientIds.filter((clientId) => {
    if (alreadyVisible.has(clientId)) return false;
    const order = byClientId[clientId];
    if (!order) return false;
    return reactiveOrderVisibility(order, filters, context);
  });

  appendVisibleOrders(idsToAppend);
};
