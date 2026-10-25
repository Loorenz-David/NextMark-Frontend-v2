import type { ReactNode } from "react";

import type { RouteTimelineTime } from "../../domain/routeTimeline.domain";
import { RouteTimelineMarker } from "./RouteTimelineMarker";

type RouteTimelineEdgeProps = {
  edge: "start" | "end";
  title: string;
  address: string;
  time: RouteTimelineTime;
  /** Shown after the title, e.g. the route warnings at the end. */
  addon?: ReactNode;
  /** False when nothing follows the start, so the line does not trail off. */
  continues?: boolean;
};

/** The route start or end: plain text beside the first or last point of the line. */
export const RouteTimelineEdge = ({
  edge,
  title,
  address,
  time,
  addon,
  continues = true,
}: RouteTimelineEdgeProps) => (
  <div className="flex items-stretch">
    <RouteTimelineMarker time={time} edge={edge} continues={continues} />
    <div
      className={`flex min-w-0 flex-1 flex-col gap-1 pl-1 ${
        edge === "start" ? "justify-start pb-3 pt-2.5" : "justify-end pb-2.5 pt-3"
      }`}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate text-2xs font-semibold uppercase tracking-wide text-[var(--color-text)]/78">
          {title}
        </span>
        {addon}
      </div>
      <span className="truncate text-xs text-[var(--color-muted)]">
        {address}
      </span>
    </div>
  </div>
);
