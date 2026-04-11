export type OrderDetailHeaderBehavior = "default" | "order-main-context";

export type OrderDetailPayload = {
  clientId?: string;
  serverId?: number;
  mode?: "view" | "edit";
  freshAfter?: string | null;
  openSource?: "card" | "marker";
  routeGroupId?: number | null;
  planStartDate?: string | null;
  headerBehavior?: OrderDetailHeaderBehavior | null;
};
