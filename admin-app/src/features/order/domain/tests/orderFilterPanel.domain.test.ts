import {
  DEFAULT_ORDER_FILTER_DRAFT,
  countActiveOrderFilters,
  draftFromOrderQueryFilters,
  normalizeOrderQueryFilters,
  orderQueryFiltersFromDraft,
  removeOrderFilterEntry,
  summarizeOrderFilterDraft,
} from "../orderFilterPanel.domain";

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

export const runOrderFilterPanelDomainTests = () => {
  // default round trip
  const defaults = orderQueryFiltersFromDraft(DEFAULT_ORDER_FILTER_DRAFT);
  assert(
    defaults.unschedule_order === true && Object.keys(defaults).length === 1,
    "default draft should produce only unschedule_order",
  );
  assert(
    draftFromOrderQueryFilters(defaults).schedule === "unscheduled",
    "unschedule_order should map back to the unscheduled mode",
  );

  // scheduled with a partial range
  const scheduled = orderQueryFiltersFromDraft({
    ...DEFAULT_ORDER_FILTER_DRAFT,
    schedule: "scheduled",
    scheduleFrom: "2026-10-01",
  });
  assert(
    scheduled.schedule_order === true &&
      scheduled.order_schedule_from === "2026-10-01" &&
      !("order_schedule_to" in scheduled) &&
      !("unschedule_order" in scheduled),
    "scheduled draft should emit schedule_order and only the set date",
  );

  // a lone date implies scheduled
  const impliedDraft = draftFromOrderQueryFilters({ order_schedule_to: "2026-10-07" });
  assert(
    impliedDraft.schedule === "scheduled" && impliedDraft.scheduleTo === "2026-10-07",
    "a schedule date without the flag should still read as scheduled",
  );

  // conflicts resolve to scheduled, string booleans accepted
  const normalized = normalizeOrderQueryFilters({
    schedule_order: true,
    unschedule_order: true,
    show_archived: "true" as unknown as boolean,
    sort: "date_asc",
    s: ["client_name"],
  });
  assert(
    normalized.schedule_order === true && !("unschedule_order" in normalized),
    "scheduled must win over unscheduled",
  );
  assert(normalized.show_archived === true, "string booleans should normalize");
  assert(
    normalized.sort === "date_asc" && Array.isArray(normalized.s),
    "non-panel keys must pass through untouched",
  );

  // unknown plan types are dropped, lists are deduped
  const typed = draftFromOrderQueryFilters({
    plan_type: ["store_pickup", "bogus", "store_pickup"],
    order_state: ["Draft", "Draft", " "],
  });
  assert(
    typed.planTypes.length === 1 && typed.planTypes[0] === "store_pickup",
    "plan types should be validated and deduped",
  );
  assert(
    typed.orderStates.length === 1 && typed.orderStates[0] === "Draft",
    "order states should be trimmed and deduped",
  );

  // the "none" sentinel is a valid plan type filter and labels as "No plan type"
  const noneDraft = draftFromOrderQueryFilters({ plan_type: ["none", "local_delivery"] });
  assert(
    noneDraft.planTypes.length === 2 && noneDraft.planTypes.includes("none"),
    "the none sentinel should survive draft parsing",
  );
  assert(
    orderQueryFiltersFromDraft(noneDraft).plan_type?.includes("none") === true,
    "the none sentinel should be sent back to the backend",
  );
  assert(
    summarizeOrderFilterDraft(noneDraft).planTypes === "No plan type, Local delivery",
    `unexpected none summary: ${summarizeOrderFilterDraft(noneDraft).planTypes}`,
  );

  // badge count matches pill count
  const count = countActiveOrderFilters({
    schedule: "scheduled",
    scheduleFrom: "2026-10-01",
    scheduleTo: null,
    orderStates: ["Draft", "Ready"],
    planTypes: ["local_delivery"],
    archivedOnly: true,
  });
  assert(count === 6, `expected 6 active filters, got ${count}`);

  // pill removal rules
  const withRange = {
    schedule_order: true,
    order_schedule_from: "2026-10-01",
    order_schedule_to: "2026-10-07",
    order_state: ["Draft", "Ready"],
    sort: "date_desc" as const,
  };
  const scheduledRemoved = removeOrderFilterEntry(withRange, "schedule_order");
  assert(
    !("schedule_order" in scheduledRemoved) &&
      !("order_schedule_from" in scheduledRemoved) &&
      !("order_schedule_to" in scheduledRemoved),
    "removing Scheduled should also clear the range",
  );
  assert(
    scheduledRemoved.sort === "date_desc",
    "removing a pill must keep pass-through keys",
  );
  const fromRemoved = removeOrderFilterEntry(withRange, "order_schedule_from");
  assert(
    fromRemoved.schedule_order === true && fromRemoved.order_schedule_to === "2026-10-07",
    "removing one date should keep the mode and the other date",
  );
  const stateRemoved = removeOrderFilterEntry(withRange, "order_state", "Draft");
  assert(
    Array.isArray(stateRemoved.order_state) &&
      stateRemoved.order_state.length === 1 &&
      stateRemoved.order_state[0] === "Ready",
    "removing one state should keep the others",
  );
  const lastStateRemoved = removeOrderFilterEntry(stateRemoved, "order_state", "Ready");
  assert(
    !("order_state" in lastStateRemoved),
    "removing the last state should drop the key",
  );
  const unscheduledRemoved = removeOrderFilterEntry({ unschedule_order: true }, "unschedule_order");
  assert(
    Object.keys(unscheduledRemoved).length === 0,
    "removing Unscheduled should leave no schedule flag",
  );

  // summaries
  const summary = summarizeOrderFilterDraft({
    schedule: "scheduled",
    scheduleFrom: "2026-10-01",
    scheduleTo: null,
    orderStates: ["Draft", "Ready", "Done"],
    planTypes: ["store_pickup"],
    archivedOnly: false,
  });
  assert(summary.schedule === "Scheduled from 2026-10-01", `unexpected schedule summary: ${summary.schedule}`);
  assert(summary.orderStates === "3 states", `unexpected states summary: ${summary.orderStates}`);
  assert(summary.planTypes === "Store pickup", `unexpected plan type summary: ${summary.planTypes}`);
  assert(summary.archive === "Active orders", `unexpected archive summary: ${summary.archive}`);
};
