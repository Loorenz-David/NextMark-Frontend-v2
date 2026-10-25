import type { ReactNode } from "react";

import type { RouteTimelineTime } from "../../domain/routeTimeline.domain";
import { RouteTimelineMarker } from "./RouteTimelineMarker";

type RouteTimelineRowProps = {
  time: RouteTimelineTime | null;
  children: ReactNode;
  /**
   * The row's card is being dragged: the card hides on the same frame while
   * its slice of the timeline stays, so the line never gaps and the time
   * shows where the card will land.
   */
  contentHidden?: boolean;
};

/** A card with its slice of the route timeline on its left. */
export const RouteTimelineRow = ({
  time,
  children,
  contentHidden = false,
}: RouteTimelineRowProps) => (
  <div className="group/stop flex items-stretch">
    <RouteTimelineMarker time={time} active={contentHidden} />
    <div
      data-route-timeline-content
      className="min-w-0 flex-1 py-2 pl-1"
      style={
        contentHidden
          ? { opacity: 0, visibility: "hidden", pointerEvents: "none" }
          : undefined
      }
    >
      {children}
    </div>
  </div>
);
