export type OrderDetailTabId =
  | "summary"
  | "notes"
  | "tracking"
  | "time_windows"
  | "event_history";

export const ORDER_DETAIL_TABS: ReadonlyArray<OrderDetailTabId> = [
  "summary",
  "notes",
  "tracking",
  "time_windows",
  "event_history",
];

export const getOrderDetailTabIndex = (tabId: OrderDetailTabId): number => {
  const index = ORDER_DETAIL_TABS.indexOf(tabId);
  return index >= 0 ? index : 0;
};
