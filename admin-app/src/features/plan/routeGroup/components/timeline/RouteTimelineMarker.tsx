import { LoadingCardBase } from "@/shared/loadingCards";

import type { RouteTimelineTime } from "../../domain/routeTimeline.domain";

type RouteTimelineMarkerProps = {
  /** `null` lets the line run through without a label. */
  time: RouteTimelineTime | null;
  /** The route start opens the line and the route end closes it. */
  edge?: "start" | "end";
  /** The stop being dragged: its time follows it to the new slot. */
  active?: boolean;
  /** At the start: false ends the line at the start's time. */
  continues?: boolean;
};

const LINE_CLASS_NAME =
  "w-0.5 min-h-2 flex-1 bg-[rgb(var(--color-light-blue-r),0.45)]";

const EdgeDot = () => (
  <span
    aria-hidden="true"
    className="h-2.5 w-2.5 shrink-0 rounded-full bg-[rgb(var(--color-light-blue-r))]"
  />
);

const TimelineLabel = ({
  time,
  active,
}: {
  time: RouteTimelineTime;
  active: boolean;
}) => {
  if (time.status === "loading") {
    return (
      <span
        className="flex py-1.5"
        aria-label="Loading expected arrival time"
        aria-busy="true"
      >
        <LoadingCardBase className="h-3 w-8 rounded-full" />
      </span>
    );
  }

  if (time.status === "none") {
    return (
      <span className="py-1.5 text-xs leading-none text-[var(--color-muted)]">
        --
      </span>
    );
  }

  return (
    <span className="flex flex-col items-center py-1.5 leading-none">
      {time.day ? (
        <span className="mb-0.5 whitespace-nowrap text-micro text-[var(--color-muted)]">
          {time.day}
        </span>
      ) : null}
      <span
        className={`text-xs font-semibold tabular-nums transition-colors duration-150 ${
          active
            ? "text-[rgb(var(--color-light-blue-r))]"
            : "text-[var(--color-text)] group-hover/stop:text-[rgb(var(--color-light-blue-r))]"
        }`}
      >
        {time.time}
      </span>
    </span>
  );
};

/**
 * One slice of the route timeline column. The line breaks around the label,
 * which sits level with the middle of the row beside it.
 */
export const RouteTimelineMarker = ({
  time,
  edge,
  active = false,
  continues = true,
}: RouteTimelineMarkerProps) => (
  <div
    className={`flex w-11 shrink-0 flex-col items-center ${
      edge === "start" ? "pt-3" : edge === "end" ? "pb-3" : ""
    }`}
  >
    {edge === "start" ? (
      <EdgeDot />
    ) : (
      <span aria-hidden="true" className={LINE_CLASS_NAME} />
    )}
    {time ? <TimelineLabel time={time} active={active} /> : null}
    {edge === "end" ? (
      <EdgeDot />
    ) : (edge === "start" ? continues : time) ? (
      <span aria-hidden="true" className={LINE_CLASS_NAME} />
    ) : null}
  </div>
);
