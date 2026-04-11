import type { TrackingTimelineEntry as TrackingEntry } from "../../../api/orderTracking.api";

interface Props {
  entry: TrackingEntry;
  isCurrent: boolean;
  teamTimezone: string | null;
}

function formatTimestamp(isoString: string, timezone: string | null): string {
  try {
    const date = new Date(isoString);
    const tz = timezone ?? undefined;
    return new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    // Fallback if timezone is invalid
    return new Date(isoString).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
}

export function TrackingTimelineEntry({ entry, isCurrent, teamTimezone }: Props) {
  return (
    <div className="flex items-start gap-4">
      {/* Dot — positioned to sit on the timeline line */}
      <div className="relative flex flex-col items-center">
        <div
          className={[
            "relative z-10 mt-1 h-3 w-3 flex-shrink-0 rounded-full",
            isCurrent
              ? "bg-[#83ccb9] shadow-[0_0_8px_rgba(131,204,185,0.6)]"
              : "bg-white/30",
          ].join(" ")}
        />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 pb-5">
        <p
          className={[
            "text-sm leading-snug",
            isCurrent ? "font-semibold text-[#83ccb9]" : "font-normal text-white/80",
          ].join(" ")}
        >
          {entry.label}
        </p>
        <p className="mt-0.5 text-xs text-white/40">
          {formatTimestamp(entry.occurred_at, teamTimezone)}
        </p>
      </div>
    </div>
  );
}
