export type OrderDetailHeaderBehavior = "default" | "order-main-context";

export type OrderDetailPayload = {
  clientId?: string;
  serverId?: number;
  mode?: "view" | "edit";
  freshAfter?: string | null;
  /** Server `event_id` of a history entry to open on, expanded and highlighted. */
  focusEventId?: string | null;
  openSource?: "card" | "marker";
  routeGroupId?: number | null;
  planStartDate?: string | null;
  headerBehavior?: OrderDetailHeaderBehavior | null;
};
