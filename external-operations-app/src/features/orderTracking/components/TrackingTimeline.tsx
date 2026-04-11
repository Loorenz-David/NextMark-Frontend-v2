import type { TrackingTimelineEntry as TrackingEntry } from "../../../api/orderTracking.api";
import { TrackingTimelineEntry } from "./TrackingTimelineEntry";

interface Props {
  timeline: TrackingEntry[];
  teamTimezone: string | null;
  currentStatusLabel: string | null;
}

export function TrackingTimeline({
  timeline,
  teamTimezone,
  currentStatusLabel: _currentStatusLabel,
}: Props) {
  if (timeline.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-white/40">
        No tracking events recorded yet.
      </div>
    );
  }

  const timelineMostRecentFirst = [...timeline].sort(
    (a, b) =>
      new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime(),
  );

  return (
    <section>
      <h2 className="mb-4 text-[0.68rem] font-semibold uppercase tracking-[0.25em] text-white/40">
        Timeline
      </h2>

      {/* Vertical timeline container */}
      <div className="relative border-l-2 border-white/10 pl-4">
        {timelineMostRecentFirst.map((entry, index) => {
          const isCurrent = index === 0;
          return (
            <TrackingTimelineEntry
              key={`${entry.event_name}-${entry.occurred_at}-${index}`}
              entry={entry}
              isCurrent={isCurrent}
              teamTimezone={teamTimezone}
            />
          );
        })}
      </div>
    </section>
  );
}
