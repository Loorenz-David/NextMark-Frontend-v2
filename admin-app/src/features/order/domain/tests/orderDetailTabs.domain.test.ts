import { resolveOrderDetailInitialTab } from "../orderDetailInitialTabRules.domain";
import {
  ORDER_DETAIL_TABS,
  getOrderDetailTabIndex,
} from "../orderDetailTabs.domain";

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

export const runOrderDetailTabsDomainTests = () => {
  assert(ORDER_DETAIL_TABS.length === 4, "should expose four detail tabs");
  assert(ORDER_DETAIL_TABS[0] === "summary", "summary should be first");
  assert(ORDER_DETAIL_TABS[1] === "notes", "notes should be second");
  assert(
    ORDER_DETAIL_TABS[2] === "time_windows",
    "time windows should be third",
  );
  assert(
    ORDER_DETAIL_TABS[3] === "event_history",
    "event history should be fourth",
  );
  assert(
    getOrderDetailTabIndex("time_windows") === 2,
    "time windows should resolve to carousel index two",
  );
  assert(
    getOrderDetailTabIndex("event_history") === 3,
    "event history should resolve to carousel index three",
  );

  const defaultSelection = resolveOrderDetailInitialTab({
    hasMissingRequiredInfo: false,
    hasTimeWindowWarning: false,
  });
  assert(defaultSelection.tabId === "summary", "default should select summary");
  assert(defaultSelection.reason === "default", "default reason should be kept");

  const missingInfoSelection = resolveOrderDetailInitialTab({
    hasMissingRequiredInfo: true,
    hasTimeWindowWarning: false,
  });
  assert(
    missingInfoSelection.tabId === "summary",
    "missing information should select summary",
  );
  assert(
    missingInfoSelection.reason === "missing_required_info",
    "missing information reason should be kept",
  );

  const timeWindowSelection = resolveOrderDetailInitialTab({
    hasMissingRequiredInfo: false,
    hasTimeWindowWarning: true,
  });
  assert(
    timeWindowSelection.tabId === "time_windows",
    "time window warnings should select time windows",
  );

  const combinedWarningSelection = resolveOrderDetailInitialTab({
    hasMissingRequiredInfo: true,
    hasTimeWindowWarning: true,
  });
  assert(
    combinedWarningSelection.tabId === "summary",
    "missing information should take priority over time window warnings",
  );
};
