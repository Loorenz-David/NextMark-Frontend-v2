import {
  buildOrderFormInitialState,
  buildOrderFormReinitKey,
  shouldReinitializeForm,
} from "../flows/orderFormBootstrap.flow";
import { normalizeFormStateForSave } from "@/features/order/api/mappers/orderForm.normalize";

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

  const restoredState = buildOrderFormInitialState({
    mode: "edit",
    order: null,
    payloadDeliveryPlanId: null,
    payloadRouteGroupId: null,
    payloadRestoreFormState: {
      ...createState,
      general_note: { content: "Legacy note" } as unknown as string,
    },
  });

  assert(
    restoredState.general_note === "Legacy note",
    "restored state should coerce legacy note objects into draft text",
  );

  const typedNotesState = buildOrderFormInitialState({
    mode: "edit",
    order: {
      id: 11,
      client_id: "order-client-typed",
      order_notes: [
        { type: "COSTUMER", content: "Customer from link" },
        { type: "GENERAL", content: "General internal" },
      ] as unknown as string[],
    },
    payloadDeliveryPlanId: null,
    payloadRouteGroupId: null,
  });

  assert(
    typedNotesState.general_note === "General internal",
    "typed GENERAL note should map to general_note field",
  );
  assert(
    typedNotesState.customer_note === "Customer from link",
    "typed COSTUMER note should map to customer_note field",
  );

  const normalized = normalizeFormStateForSave({
    ...typedNotesState,
    general_note: "General updated",
    customer_note: "Customer updated",
  });

  const normalizedOrderNotes = normalized.order_notes as Array<
    { type?: unknown; content?: unknown } | string
  >;
  const generalEntry = normalizedOrderNotes.find(
    (entry) =>
      typeof entry === "object" &&
      entry != null &&
      String((entry as { type?: unknown }).type).toUpperCase() === "GENERAL",
  ) as { content?: unknown } | undefined;
  const customerEntry = normalizedOrderNotes.find(
    (entry) =>
      typeof entry === "object" &&
      entry != null &&
      String((entry as { type?: unknown }).type).toUpperCase() === "COSTUMER",
  ) as { content?: unknown } | undefined;

  assert(
    generalEntry?.content === "General updated",
    "saving should target and update GENERAL note object",
  );
  assert(
    customerEntry?.content === "Customer updated",
    "saving should target and update COSTUMER note object",
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
