import type { AssignedRoutePageDisplay } from '../domain/assignedRouteDisplay.types'
import { AssignedRouteStopRow } from './AssignedRouteStopRow'
import { AssignedRouteTimelineEnd } from './AssignedRouteTimelineEnd'
import { AssignedRouteTimelineStart } from './AssignedRouteTimelineStart'

type AssignedRouteTimelineSurfaceProps = {
  timeline: NonNullable<AssignedRoutePageDisplay['timeline']>
  onOpenStopDetail: (stopClientId: string) => void
}

export function AssignedRouteTimelineSurface({
  timeline,
  onOpenStopDetail,
}: AssignedRouteTimelineSurfaceProps) {
  return (
    <section className=" overflow-hidden  ">
      <AssignedRouteTimelineStart start={timeline.start} />

      <div>
        {timeline.stops.map((stop) => (
          <div
            key={stop.stopClientId}
          >
            <AssignedRouteStopRow
              onOpenStopDetail={onOpenStopDetail}
              stop={stop}
            />
          </div>
        ))}
      </div>
      

      <AssignedRouteTimelineEnd end={timeline.end} />
    </section>
  )
}
