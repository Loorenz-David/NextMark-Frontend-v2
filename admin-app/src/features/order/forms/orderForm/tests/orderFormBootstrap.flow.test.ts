import {
  buildOrderFormInitialState,
  buildOrderFormReinitKey,
  shouldReinitializeForm,
} from "../flows/orderFormBootstrap.flow";

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

export const runOrderFormBootstrapFlowTests = () => {
  const createState = buildOrderFormInitialState({
    mode: "create",
    order: null,
    payloadDeliveryPlanId: 42,
    payloadRouteGroupId: 7,
  });

  assert(
    createState.delivery_plan_id === 42,
    "create state should use payload delivery plan id",
  );
  assert(
    createState.route_group_id === 7,
    "create state should use payload route group id",
  );
  assert(
    createState.client_id.length > 0,
    "create state should generate client id",
  );
  assert(
    typeof createState.reference_number === "string" &&
      createState.reference_number.length > 0,
    "create state should generate reference number",
  );

  const editState = buildOrderFormInitialState({
    mode: "edit",
    order: {
      id: 10,
      client_id: "order-client-1",
      reference_number: "REF-100",
      external_source: "shopify",
      delivery_plan_id: 55,
      route_group_id: 12,
    },
    payloadDeliveryPlanId: null,
    payloadRouteGroupId: null,
  });

  assert(
    editState.client_id === "order-client-1",
    "edit state should keep existing client id",
  );
  assert(
    editState.reference_number === "REF-100",
    "edit state should keep existing reference",
  );
  assert(
    editState.delivery_plan_id === 55,
    "edit state should keep existing delivery plan id",
  );
  assert(
    editState.route_group_id === 12,
    "edit state should keep existing route group id",
  );

  const keyA = buildOrderFormReinitKey({
    mode: "edit",
    payloadClientId: "client-1",
    payloadDeliveryPlanId: 1,
    payloadRouteGroupId: 2,
    orderServerId: 100,
    orderUpdatedAt: "2026-04-05T10:00:00Z",
    orderItemsUpdatedAt: "2026-04-05T10:00:00Z",
    orderClientFormSubmittedAt: null,
  });
  const keyB = buildOrderFormReinitKey({
    mode: "edit",
    payloadClientId: "client-1",
    payloadDeliveryPlanId: 1,
    payloadRouteGroupId: 2,
    orderServerId: 100,
    orderUpdatedAt: "2026-04-05T10:00:00Z",
    orderItemsUpdatedAt: "2026-04-05T10:00:00Z",
    orderClientFormSubmittedAt: null,
  });
  const keyC = buildOrderFormReinitKey({
    mode: "create",
    payloadClientId: "client-1",
    payloadDeliveryPlanId: 1,
    payloadRouteGroupId: 2,
    orderServerId: 100,
    orderUpdatedAt: "2026-04-05T10:00:00Z",
    orderItemsUpdatedAt: "2026-04-05T10:00:00Z",
    orderClientFormSubmittedAt: null,
  });
  const keyD = buildOrderFormReinitKey({
    mode: "edit",
    payloadClientId: "client-1",
    payloadDeliveryPlanId: 1,
    payloadRouteGroupId: 2,
    orderServerId: 100,
    orderUpdatedAt: "2026-04-05T10:05:00Z",
    orderItemsUpdatedAt: "2026-04-05T10:00:00Z",
    orderClientFormSubmittedAt: null,
  });

  assert(
    keyA === keyB,
    "reinit key should be stable when key fields are unchanged",
  );
  assert(keyA !== keyC, "reinit key should change when mode changes");
  assert(keyA !== keyD, "reinit key should change when order revision changes");

  assert(
    !shouldReinitializeForm(keyA, keyA),
    "should not reinitialize when key is unchanged",
  );
  assert(
    shouldReinitializeForm(keyA, keyC),
    "should reinitialize when key changes",
  );
};
