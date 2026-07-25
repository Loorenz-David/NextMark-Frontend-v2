import type { Order } from "@/features/order/types/order";

import { mergeOrderResponseForStore } from "../orderResponse.normalize";

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const createOrder = (overrides: Partial<Order> = {}): Order =>
  ({
    id: 4507,
    client_id: "order-test",
    order_state_id: 2,
    order_notes: [
      { type: "GENERAL", content: "Optimistic general note" },
      { type: "COSTUMER", content: "Optimistic customer note" },
    ],
    __optimistic: true,
    ...overrides,
  }) as Order;

export const runOrderResponseNormalizeTests = () => {
  const currentOrder = createOrder();
  const partialResponse = createOrder({
    reference_number: "24.57.8570",
    order_notes: undefined,
  });
  const mergedPartial = mergeOrderResponseForStore(
    currentOrder,
    partialResponse,
  );

  assert(
    mergedPartial.order_notes === currentOrder.order_notes,
    "an update response that omits notes should preserve optimistic notes",
  );
  assert(
    mergedPartial.reference_number === "24.57.8570",
    "server fields should still replace their optimistic values",
  );
  assert(
    mergedPartial.__optimistic === undefined,
    "a committed response should clear the optimistic marker",
  );

  const clearedNotes = mergeOrderResponseForStore(
    currentOrder,
    createOrder({ order_notes: null }),
  );
  assert(
    clearedNotes.order_notes === null,
    "an explicit null response should clear stored notes",
  );

  const authoritativeNotes = mergeOrderResponseForStore(
    currentOrder,
    createOrder({
      order_notes: [{ type: "FAILURE", content: " Server failure note " }],
    }),
  );
  const authoritativeNote = authoritativeNotes.order_notes?.[0];
  assert(
    typeof authoritativeNote === "object" &&
      authoritativeNote.type === "FAILURE" &&
      authoritativeNote.content === "Server failure note",
    "notes included by the server should replace and normalize optimistic notes",
  );
};
