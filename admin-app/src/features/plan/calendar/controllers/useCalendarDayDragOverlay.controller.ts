import { useCallback, useEffect, useRef } from "react";
import { useDndContext } from "@dnd-kit/core";

import {
  buildCalendarOverlayDroppableId,
  buildPlanDroppableId,
} from "@/features/plan/dnd/domain/droppableIds";

import { isCalendarDayDragTarget } from "../domain/calendarDayDragTarget";
import type { CalendarDayKey } from "../domain/planCalendar.domain";
import { usePlanCalendarStore } from "../store/planCalendar.store";

// Drag shapes that can be assigned to a plan: plain orders and orders already
// placed on a route. Both need the multi-plan overlay to open on hover so
// their drop can land on an individual plan card inside it.
const PLAN_ASSIGNABLE_DRAG_TYPES = new Set([
  "order",
  "order_batch",
  "order_group",
  "route_stop",
  "route_stop_group",
]);

/**
 * Moving from the day cell into its floating overlay crosses the gap between
 * them (and whatever cell sits under that gap). The overlay only closes once
 * the pointer has been away for longer than that crossing takes.
 */
const DRAG_LEAVE_GRACE_MS = 220;

type UseCalendarDayDragOverlayControllerParams = {
  dateKey: CalendarDayKey;
  planClientIds: string[];
  hasMultiplePlans: boolean;
  isPast: boolean;
  /** dnd-kit `isOver` of the day cell's own droppable. */
  isOverCell: boolean;
};

/**
 * Owns the multi-plan day overlay's drag lifecycle: opens (or hands off) the
 * overlay while a plan-assignable drag hovers the day, closes it once the drag
 * leaves the day's drop area, and re-measures the overlay's droppables after
 * floating-ui positions it — dnd-kit measures a droppable once when it
 * registers, which for a portaled popover happens before it has been placed.
 */
export const useCalendarDayDragOverlayController = ({
  dateKey,
  planClientIds,
  hasMultiplePlans,
  isPast,
  isOverCell,
}: UseCalendarDayDragOverlayControllerParams) => {
  const { active, over, measureDroppableContainers } = useDndContext();
  const dragOverlayDateKey = usePlanCalendarStore(
    (state) => state.dragOverlayDateKey,
  );
  const setDragOverlayDateKey = usePlanCalendarStore(
    (state) => state.setDragOverlayDateKey,
  );

  const activeDragType = String(active?.data.current?.type ?? "");
  const isPlanAssignableDrag = PLAN_ASSIGNABLE_DRAG_TYPES.has(activeDragType);
  const isDragOverlayOpen = dragOverlayDateKey === dateKey;
  const isDragOverDay = isCalendarDayDragTarget({
    overId: over?.id,
    dateKey,
    planClientIds,
  });

  // Hovering a multi-plan day with an assignable drag opens the overlay, or
  // hands it off from whichever day held it before.
  useEffect(() => {
    if (!isOverCell || !isPlanAssignableDrag) return;
    if (!hasMultiplePlans || isPast) return;
    setDragOverlayDateKey(dateKey);
  }, [
    isOverCell,
    isPlanAssignableDrag,
    hasMultiplePlans,
    isPast,
    dateKey,
    setDragOverlayDateKey,
  ]);

  // Once the drag is no longer over the day, its overlay, or a card inside
  // the overlay, close it. Only while a drag is in flight: after a drop the
  // page keeps the overlay up briefly so the card's drop feedback is seen.
  useEffect(() => {
    if (!isDragOverlayOpen || !isPlanAssignableDrag || isDragOverDay) return;
    const timeout = setTimeout(() => {
      setDragOverlayDateKey(null);
    }, DRAG_LEAVE_GRACE_MS);
    return () => clearTimeout(timeout);
  }, [
    isDragOverlayOpen,
    isPlanAssignableDrag,
    isDragOverDay,
    setDragOverlayDateKey,
  ]);

  // Re-measures the overlay and its cards. Called when the popover is placed
  // and again once its scale-in settles (the rect includes the in-flight
  // transform). Both hooks re-fire on every reposition, so the identity must
  // not change with each cell render.
  const planClientIdsRef = useRef(planClientIds);
  planClientIdsRef.current = planClientIds;
  const remeasureOverlayDroppables = useCallback(() => {
    measureDroppableContainers([
      buildCalendarOverlayDroppableId(dateKey),
      ...planClientIdsRef.current.map(buildPlanDroppableId),
    ]);
  }, [dateKey, measureDroppableContainers]);

  return {
    isDragOverlayOpen,
    remeasureOverlayDroppables,
  };
};
