import type { AssignedRoutePageDisplay } from "../domain/assignedRouteDisplay.types";
import { AssignedRouteStopRow } from "./AssignedRouteStopRow";
import { AssignedRouteTimelineEnd } from "./AssignedRouteTimelineEnd";
import { AssignedRouteTimelineStart } from "./AssignedRouteTimelineStart";

type AssignedRouteTimelineSurfaceProps = {
  timeline: NonNullable<AssignedRoutePageDisplay["timeline"]>;
  onOpenStopDetail: (stopClientId: string) => void;
  onNavigateToStart: () => void;
  onNavigateToEnd: () => void;
  focusedStopClientId?: string | null;
};

export function AssignedRouteTimelineSurface({
  timeline,
  onOpenStopDetail,
  onNavigateToStart,
  onNavigateToEnd,
  focusedStopClientId,
}: AssignedRouteTimelineSurfaceProps) {
  return (
    <section className=" overflow-hidden  ">
      <AssignedRouteTimelineStart start={timeline.start} onNavigate={onNavigateToStart} />

      <div>
        {timeline.stops.map((stop) => (
          <div key={stop.stopClientId}>
            <AssignedRouteStopRow
              isFocused={focusedStopClientId === stop.stopClientId}
              onOpenStopDetail={onOpenStopDetail}
              stop={stop}
            />
          </div>
        ))}
      </div>

      <AssignedRouteTimelineEnd end={timeline.end} onNavigate={onNavigateToEnd} />
    </section>
  );
}
