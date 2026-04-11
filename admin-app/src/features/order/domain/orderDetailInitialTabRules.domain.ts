import type { OrderDetailTabId } from "./orderDetailTabs.domain";

type ResolveOrderDetailInitialTabParams = {
  hasMissingRequiredInfo: boolean;
  hasTimeWindowWarning: boolean;
};

export type OrderDetailInitialTabRuleReason =
  | "missing_required_info"
  | "time_window_warning"
  | "default";

export type OrderDetailInitialTabSelection = {
  tabId: OrderDetailTabId;
  reason: OrderDetailInitialTabRuleReason;
};

export const resolveOrderDetailInitialTab = ({
  hasMissingRequiredInfo,
  hasTimeWindowWarning,
}: ResolveOrderDetailInitialTabParams): OrderDetailInitialTabSelection => {
  if (hasMissingRequiredInfo) {
    return { tabId: "tracking", reason: "missing_required_info" };
  }

  if (hasTimeWindowWarning) {
    return { tabId: "time_windows", reason: "time_window_warning" };
  }

  return { tabId: "summary", reason: "default" };
};
