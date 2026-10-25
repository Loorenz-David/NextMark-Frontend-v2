/** What the timeline shows beside a stop or route end. */
export type RouteTimelineTime =
  | { status: "time"; time: string; day: string | null }
  | { status: "loading" }
  | { status: "none" };

const DAY_AND_TIME = /^(.+) - (\d{2}:\d{2})$/;
const TIME_ONLY = /^\d{2}:\d{2}$/;

/**
 * Turns an arrival time into its timeline label. `formatLabel` is the route
 * time formatter bound to the plan date: it yields "09:45" on the plan day and
 * "Oct 26 - 09:45" on another day, which the timeline stacks as day over time.
 */
export const resolveRouteTimelineTime = (
  value: string | null | undefined,
  formatLabel: (value: string) => string,
): RouteTimelineTime => {
  if (value === "loading") return { status: "loading" };
  if (!value) return { status: "none" };

  const label = formatLabel(value).trim();
  if (TIME_ONLY.test(label)) return { status: "time", time: label, day: null };

  const dayAndTime = DAY_AND_TIME.exec(label);
  if (dayAndTime) {
    return { status: "time", time: dayAndTime[2], day: dayAndTime[1] };
  }

  return { status: "none" };
};
