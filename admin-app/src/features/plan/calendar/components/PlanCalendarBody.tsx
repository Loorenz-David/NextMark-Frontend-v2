import { useMemo, useRef } from "react";

import type { DeliveryPlan } from "@/features/plan/types/plan";
import { getRoutePlanIsoWeekNumber } from "@/features/plan/routeGroup/domain/routePlanDate";

import type {
  CalendarDayCellModel,
  CalendarDayKey,
} from "../domain/planCalendar.domain";
import { CALENDAR_WEEKDAY_LABELS } from "../domain/planCalendar.domain";
import { PlanCalendarDayCell } from "./PlanCalendarDayCell";

type PlanCalendarBodyProps = {
  cells: CalendarDayCellModel[];
  plansByDay: Map<CalendarDayKey, DeliveryPlan[]>;
  volumeCapacityByPlanId: Record<number, number | null>;
  onOpenPlan: (plan: DeliveryPlan) => void;
  onCreateForDate: (dateKey: CalendarDayKey) => void;
};

const NO_PLANS: DeliveryPlan[] = [];

/** Week-number gutter + 7 day columns. */
const GRID_TEMPLATE_COLUMNS = "28px repeat(7, minmax(0, 1fr))";

export const PlanCalendarBody = ({
  cells,
  plansByDay,
  volumeCapacityByPlanId,
  onOpenPlan,
  onCreateForDate,
}: PlanCalendarBodyProps) => {
  const weeks = useMemo(() => {
    const rows: CalendarDayCellModel[][] = [];
    for (let index = 0; index < cells.length; index += 7) {
      rows.push(cells.slice(index, index + 7));
    }
    return rows;
  }, [cells]);

  // Day overlays are portaled to the body; this is the box they must stay
  // inside so they never spill over the column to the calendar's right.
  const overlayBoundaryRef = useRef<HTMLDivElement | null>(null);

  return (
    <div
      ref={overlayBoundaryRef}
      className="flex min-h-0 flex-1 flex-col gap-2 px-4 pb-4 pt-3"
    >
      <div
        className="grid shrink-0 gap-2"
        style={{ gridTemplateColumns: GRID_TEMPLATE_COLUMNS }}
      >
        <span aria-hidden="true" />
        {CALENDAR_WEEKDAY_LABELS.map((label) => (
          <span
            key={label}
            className="text-center font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-muted)]/80"
          >
            {label}
          </span>
        ))}
      </div>

      <div
        className="grid min-h-0 flex-1 gap-2"
        style={{
          gridTemplateColumns: GRID_TEMPLATE_COLUMNS,
          gridAutoRows: "minmax(0, 1fr)",
        }}
      >
        {weeks.map((week) => {
          const weekNumber = getRoutePlanIsoWeekNumber(week[0]?.dateKey);
          return [
            <span
              key={`week-${week[0]?.dateKey}`}
              className="flex min-h-0 items-center justify-center font-mono text-[10px] uppercase tracking-[0.06em] text-[var(--color-muted)]/70"
              title={weekNumber != null ? `Week ${weekNumber}` : undefined}
            >
              {weekNumber != null ? `V${weekNumber}` : ""}
            </span>,
            ...week.map((cell) => (
              <PlanCalendarDayCell
                key={cell.dateKey}
                cell={cell}
                plans={plansByDay.get(cell.dateKey) ?? NO_PLANS}
                volumeCapacityByPlanId={volumeCapacityByPlanId}
                onOpenPlan={onOpenPlan}
                onCreateForDate={onCreateForDate}
                overlayBoundaryRef={overlayBoundaryRef}
              />
            )),
          ];
        })}
      </div>
    </div>
  );
};
