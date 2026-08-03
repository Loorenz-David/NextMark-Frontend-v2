import type { Order } from "../../types/order";
import {
  clearOrders,
  setOrders,
  setVisibleOrders,
  updateOrderByClientId,
  useOrderStore,
} from "../../store/order.store";
import { resetQuery, setQueryFilters } from "../../store/orderQuery.store";
import { syncOrdersIntoVisibleList } from "../syncOrdersIntoVisibleList.action";

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const buildOrder = (overrides: Partial<Order> = {}): Order => ({
  id: 5836,
  client_id: "order-a",
  ...overrides,
});

const seedStore = (orders: Order[], visibleIds: string[]) => {
  clearOrders();
  setOrders({
    allIds: orders.map((order) => order.client_id),
    byClientId: Object.fromEntries(
      orders.map((order) => [order.client_id, order]),
    ),
  });
  setVisibleOrders(visibleIds);
};

export const runSyncOrdersIntoVisibleListTests = () => {
  resetQuery();

  // The reported case: the list was fetched with the default "unscheduled only"
  // query, so a planned order is absent from visibleIds. Unscheduling it has to
  // put it back, or it stays invisible until a reload.
  seedStore([buildOrder({ delivery_plan_id: 959 })], []);
  updateOrderByClientId("order-a", (order) => ({
    ...order,
    delivery_plan_id: null,
  }));
  syncOrdersIntoVisibleList(["order-a"]);
  assert(
    useOrderStore.getState().visibleIds?.includes("order-a") === true,
    "an unscheduled order is added to the visible list",
  );

  // An order still on a plan does not match the default query and must not be
  // pushed into the list.
  seedStore([buildOrder({ delivery_plan_id: 959 })], []);
  syncOrdersIntoVisibleList(["order-a"]);
  assert(
    useOrderStore.getState().visibleIds?.length === 0,
    "a still-scheduled order is not added",
  );

  // Already present: no duplicate row.
  seedStore([buildOrder({ delivery_plan_id: null })], ["order-a"]);
  syncOrdersIntoVisibleList(["order-a"]);
  assert(
    useOrderStore.getState().visibleIds?.length === 1,
    "an order already in the list is not duplicated",
  );

  // Unknown ids are ignored rather than inserted as holes the list cannot render.
  seedStore([buildOrder({ delivery_plan_id: null })], []);
  syncOrdersIntoVisibleList(["order-missing"]);
  assert(
    useOrderStore.getState().visibleIds?.length === 0,
    "ids with no order in the store are skipped",
  );

  // With the opposite filter active, an unscheduled order must stay out.
  seedStore([buildOrder({ delivery_plan_id: null })], []);
  setQueryFilters({ schedule_order: true });
  syncOrdersIntoVisibleList(["order-a"]);
  assert(
    useOrderStore.getState().visibleIds?.length === 0,
    "the active query decides, not the mutation",
  );

  // No list query has run yet: nothing to keep in sync.
  resetQuery();
  seedStore([buildOrder({ delivery_plan_id: null })], []);
  setVisibleOrders(null);
  syncOrdersIntoVisibleList(["order-a"]);
  assert(
    useOrderStore.getState().visibleIds === null,
    "a list that has never been fetched is left untouched",
  );

  resetQuery();
  clearOrders();
};
