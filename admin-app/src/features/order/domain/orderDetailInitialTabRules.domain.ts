import type { OrderDetailTabId } from "./orderDetailTabs.domain";

type ResolveOrderDetailInitialTabParams = {
  hasFocusEvent?: boolean;
  hasMissingRequiredInfo: boolean;
  hasTimeWindowWarning: boolean;
};

export type OrderDetailInitialTabRuleReason =
  | "focus_event"
  | "missing_required_info"
  | "time_window_warning"
  | "default";

export type OrderDetailInitialTabSelection = {
  tabId: OrderDetailTabId;
  reason: OrderDetailInitialTabRuleReason;
};

export const resolveOrderDetailInitialTab = ({
  hasFocusEvent = false,
  hasMissingRequiredInfo,
  hasTimeWindowWarning,
}: ResolveOrderDetailInitialTabParams): OrderDetailInitialTabSelection => {
  // Opened to show one event (e.g. from a notification): that is the point.
  if (hasFocusEvent) {
    return { tabId: "event_history", reason: "focus_event" };
  }

  if (hasMissingRequiredInfo) {
    return { tabId: "summary", reason: "missing_required_info" };
  }

  if (hasTimeWindowWarning) {
    return { tabId: "time_windows", reason: "time_window_warning" };
  }

  return { tabId: "summary", reason: "default" };
};
