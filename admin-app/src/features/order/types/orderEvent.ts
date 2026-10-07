import type {
  OrderEventAction,
  OrderEventActionStatus,
  OrderEventActor,
  OrderEventChange,
  OrderEventItem,
} from "@shared-api";

export type { OrderEventActionStatus };
export type { OrderEventItem };

export type OrderEvent = OrderEventItem & {
  client_id: string;
};

export type OrderEventMap = {
  byClientId: Record<string, OrderEvent>;
  allIds: string[];
};

export type { OrderEventAction, OrderEventActor, OrderEventChange };

export const ORDER_EVENT_ACTION_STATUS: Record<
  OrderEventActionStatus,
  OrderEventActionStatus
> = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  SKIPPED: "SKIPPED",
};
