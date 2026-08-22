import type { UniqueIdentifier } from "@dnd-kit/core";

import {
  buildCalendarDayDroppableId,
  buildCalendarOverlayDroppableId,
  buildPlanDroppableId,
} from "@/features/plan/dnd/domain/droppableIds";

type IsCalendarDayDragTargetParams = {
  overId: UniqueIdentifier | null | undefined;
  dateKey: string;
  planClientIds: string[];
};

/**
 * True when the drag is over any surface that belongs to this day: the day
 * cell, its floating plans overlay, or one of the plan cards inside that
 * overlay. Used to keep the overlay open only while the pointer is still
 * somewhere within the day's drop area.
 */
export const isCalendarDayDragTarget = ({
  overId,
  dateKey,
  planClientIds,
}: IsCalendarDayDragTargetParams): boolean => {
  if (overId == null) return false;
  const id = String(overId);
  return (
    id === buildCalendarDayDroppableId(dateKey) ||
    id === buildCalendarOverlayDroppableId(dateKey) ||
    planClientIds.some((clientId) => buildPlanDroppableId(clientId) === id)
  );
};
