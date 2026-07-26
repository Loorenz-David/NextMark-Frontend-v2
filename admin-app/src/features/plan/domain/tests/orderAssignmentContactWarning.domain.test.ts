import type { Order } from "@/features/order";

import { shouldWarnForMissingOrderAssignmentContact } from "../orderAssignmentContactWarning.domain";

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const buildOrder = (overrides: Partial<Order> = {}): Order => ({
  id: 42,
  client_id: "order-42",
  delivery_plan_id: null,
  client_email: null,
  client_primary_phone: null,
  ...overrides,
});

const assignIntent = {
  kind: "ASSIGN_ORDER_TO_PLAN" as const,
  orderClientId: "order-42",
  planClientId: "plan-7",
};

export const runOrderAssignmentContactWarningDomainTests = () => {
  assert(
    shouldWarnForMissingOrderAssignmentContact({
      intent: assignIntent,
      order: buildOrder(),
    }),
    "an unscheduled order without either contact should warn",
  );

  assert(
    shouldWarnForMissingOrderAssignmentContact({
      intent: assignIntent,
      order: buildOrder({
        client_email: " ",
        client_primary_phone: { prefix: "+46", number: " " },
      }),
    }),
    "whitespace-only contacts should be missing",
  );

  assert(
    !shouldWarnForMissingOrderAssignmentContact({
      intent: assignIntent,
      order: buildOrder({ client_email: "customer@example.com" }),
    }),
    "an email should suppress the warning",
  );

  assert(
    !shouldWarnForMissingOrderAssignmentContact({
      intent: assignIntent,
      order: buildOrder({
        client_primary_phone: { prefix: "+46", number: "701234567" },
      }),
    }),
    "a primary phone should suppress the warning",
  );

  assert(
    !shouldWarnForMissingOrderAssignmentContact({
      intent: assignIntent,
      order: buildOrder({ delivery_plan_id: 7 }),
    }),
    "already-scheduled orders should not warn",
  );

  assert(
    !shouldWarnForMissingOrderAssignmentContact({
      intent: {
        kind: "ASSIGN_ORDERS_TO_PLAN_BATCH",
        planClientId: "plan-7",
        selection: {
          manual_order_ids: [42],
          select_all_snapshots: [],
          excluded_order_ids: [],
          source: "group",
        },
      },
      order: buildOrder(),
    }),
    "batch assignments remain outside this warning",
  );
};
