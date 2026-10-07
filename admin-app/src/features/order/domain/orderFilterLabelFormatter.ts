import {
  ORDER_PLAN_TYPE_FILTER_LABELS,
  isOrderPlanTypeFilter,
} from "./orderFilterPanel.domain";

/** Pill labels for the keys the order filter panel owns. */
export const formatOrderFilterPill = (key: string, value?: unknown): string => {
  switch (key) {
    case "unschedule_order":
      return "Unscheduled";
    case "schedule_order":
      return "Scheduled";
    case "order_schedule_from":
      return `From ${String(value ?? "")}`.trim();
    case "order_schedule_to":
      return `To ${String(value ?? "")}`.trim();
    case "order_state":
      return String(value ?? "");
    case "plan_type":
      return isOrderPlanTypeFilter(value)
        ? ORDER_PLAN_TYPE_FILTER_LABELS[value]
        : String(value ?? "");
    case "show_archived":
      return "Archived only";
    default:
      return value === undefined || value === null || value === ""
        ? key
        : `${key}: ${String(value)}`;
  }
};
