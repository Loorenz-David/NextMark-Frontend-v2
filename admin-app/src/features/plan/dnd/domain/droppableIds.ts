/**
 * dnd-kit droppable ids for plan drop targets. Kept in one place so the
 * components that register a droppable and the controllers that need to
 * recognise or re-measure it agree on the id without duplicating the format.
 */
export const buildPlanDroppableId = (planClientId: string): string =>
  `plan-${planClientId}`;

export const buildCalendarDayDroppableId = (dateKey: string): string =>
  `calendar-day-${dateKey}`;

export const buildCalendarOverlayDroppableId = (dateKey: string): string =>
  `calendar-overlay-${dateKey}`;
