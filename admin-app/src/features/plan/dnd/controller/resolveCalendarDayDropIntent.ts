import type { DragEndEvent, DragOverEvent } from "@dnd-kit/core";

import type { OrderBatchSelectionPayload } from "@/features/order/types/orderBatchSelection";
import { resolveCreatePlanOrderIds } from "@/features/plan/dnd/domain/resolveCreatePlanOrderIds";

import type { ResolveDropIntentResult } from "./resolveDropIntent";

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const toPositiveIntArray = (value: unknown): number[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item > 0);
};

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item ?? "").trim())
    .filter((item) => item.length > 0);
};

type ResolveCalendarDayDropIntentParams = {
  event: DragOverEvent | DragEndEvent;
  activeOrderClientId?: string;
  selectionState: unknown;
  selectionModeEnabled: boolean;
  isActiveOrderSelected: boolean;
  maxBatchIds: number;
  confirmLargeBatch: (count: number) => boolean;
  // The selection-store state flows through opaquely; the callback owns its typing.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  buildSelectionBatchPayload: (state: any) => OrderBatchSelectionPayload;
  buildManualBatchSelection: (orderIds: number[]) => OrderBatchSelectionPayload;
};

/**
 * Resolves a drop over a `calendar-day` target: a day with exactly one plan
 * becomes a plain assign intent and an empty day becomes
 * create-plan-with-orders. Days with several plans are no-ops here — their
 * drops must land on a plan card inside the day's floating overlay.
 */
export const resolveCalendarDayDropIntent = ({
  event,
  activeOrderClientId,
  selectionState,
  selectionModeEnabled,
  isActiveOrderSelected,
  maxBatchIds,
  confirmLargeBatch,
  buildSelectionBatchPayload,
  buildManualBatchSelection,
}: ResolveCalendarDayDropIntentParams): ResolveDropIntentResult => {
  const activeData = asRecord(event.active.data.current);
  const overData = asRecord(event.over?.data.current);
  const activeType = String(activeData.type ?? "");

  const dateKey = String(overData.dateKey ?? "").trim();
  if (!dateKey) return { type: "noop" };

  if (overData.isPast === true) {
    return {
      type: "warning",
      status: 400,
      message: "Orders can't be scheduled on a past date.",
    };
  }

  const planClientIds = toStringArray(overData.planClientIds);
  const selectedServerIds = asRecord(selectionState).selectedServerIds;

  let singleOrderClientId: string | undefined;
  let batchSelection: OrderBatchSelectionPayload | undefined;
  let orderServerIds: number[] = [];

  // Orders already placed on a route (route_stop/route_stop_group) are
  // assignable to a plan exactly like plain orders — they just never carry a
  // selection-mode batch, since selection applies to the order list only.
  let origin: "order_list" | "route_group" = "order_list";

  if (activeType === "order" && selectionModeEnabled) {
    if (!isActiveOrderSelected) {
      return {
        type: "warning",
        status: 400,
        message: "Drag a selected order when selection mode is active.",
      };
    }
    batchSelection = buildSelectionBatchPayload(selectionState);
    orderServerIds = resolveCreatePlanOrderIds({
      activeData,
      selectedServerIds,
      selectionModeEnabled,
      isActiveOrderSelected,
    });
  } else if (activeType === "order" || activeType === "route_stop") {
    if (!activeOrderClientId) return { type: "noop" };
    singleOrderClientId = activeOrderClientId;
    orderServerIds = resolveCreatePlanOrderIds({ activeData });
    if (activeType === "route_stop") origin = "route_group";
  } else if (activeType === "order_batch") {
    if (!selectionModeEnabled) return { type: "noop" };
    batchSelection = buildSelectionBatchPayload(selectionState);
    orderServerIds = resolveCreatePlanOrderIds({
      activeData,
      selectedServerIds,
      selectionModeEnabled: true,
      isActiveOrderSelected: true,
    });
  } else if (activeType === "order_group" || activeType === "route_stop_group") {
    const manualIds = toPositiveIntArray(activeData.orderIds);
    if (!manualIds.length) return { type: "noop" };
    if (manualIds.length > maxBatchIds && !confirmLargeBatch(manualIds.length)) {
      return { type: "noop" };
    }
    batchSelection = buildManualBatchSelection(manualIds);
    orderServerIds = manualIds;
    if (activeType === "route_stop_group") origin = "route_group";
  } else {
    return { type: "noop" };
  }

  if (planClientIds.length === 1) {
    const planClientId = planClientIds[0];
    if (singleOrderClientId) {
      return {
        type: "intent",
        intent: {
          kind: "ASSIGN_ORDER_TO_PLAN",
          orderClientId: singleOrderClientId,
          planClientId,
        },
      };
    }
    if (batchSelection) {
      return {
        type: "intent",
        intent: {
          kind: "ASSIGN_ORDERS_TO_PLAN_BATCH",
          planClientId,
          selection: batchSelection,
          origin,
        },
      };
    }
    return { type: "noop" };
  }

  if (planClientIds.length === 0) {
    if (orderServerIds.length === 0) {
      return {
        type: "warning",
        status: 400,
        message: "The dropped order does not have a valid server ID.",
      };
    }
    return {
      type: "intent",
      intent: { kind: "CREATE_PLAN_FOR_DATE", dateKey, orderServerIds },
    };
  }

  // Several plans: the day's overlay (opened while hovering with the drag)
  // exposes the actual drop targets, so the cell itself accepts nothing.
  return { type: "noop" };
};
