import type { OrderTrackingData } from "../../../api/orderTracking.api";
import { TrackingStatusChip } from "./TrackingStatusChip";

interface Props {
  data: OrderTrackingData;
}

function formatDeliveryWindow(
  start_at: string,
  end_at: string,
  timezone: string | null,
): string {
  try {
    const tz = timezone ?? undefined;
    const fmt = (iso: string, includeDate: boolean) =>
      new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        ...(includeDate
          ? { weekday: "short", month: "short", day: "numeric" }
          : {}),
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(new Date(iso));

    const startStr = fmt(start_at, true);
    const endStr = fmt(end_at, false);
    return `Scheduled: ${startStr} – ${endStr}`;
  } catch {
    return "Scheduled window available";
  }
}

function formatLastUpdated(isoString: string, timezone: string | null): string {
  try {
    const tz = timezone ?? undefined;
    return new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(isoString));
  } catch {
    return new Date(isoString).toLocaleString();
  }
}

export function TrackingSummaryCard({ data }: Props) {
  const {
    tracking_number,
    reference_number,
    team_name,
    team_timezone,
    current_status,
    current_status_label,
    delivery_window_summary,
    timeline,
  } = data;

  const showReference =
    reference_number && reference_number !== tracking_number;

  const latestEntry =
    timeline.length > 0 ? timeline[timeline.length - 1] : null;

  return (
    <div className="backdrop-blur-2xl bg-white/[0.06] border border-white/10 rounded-[28px] p-6 space-y-4">
      {/* Team name */}

      {/* Tracking number */}
      <div className="space-y-1">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-white/30">
          Tracking Number
        </p>
        <p className="font-mono text-2xl font-semibold tracking-wide text-[#83ccb9]">
          {tracking_number ?? "—"}
        </p>

        {/* Reference number (if different) */}
        {showReference && (
          <p className="text-xs text-white/40">
            Ref: <span className="font-mono">{reference_number}</span>
          </p>
        )}
      </div>

      {/* Status chip */}
      <div>
        <TrackingStatusChip
          status={current_status}
          label={current_status_label}
        />
      </div>

      {/* Delivery window */}
      {delivery_window_summary && (
        <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.04] px-4 py-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#83ccb9"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 flex-shrink-0 opacity-80"
            aria-hidden="true"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <p className="text-sm text-white/70">
            {formatDeliveryWindow(
              delivery_window_summary.start_at,
              delivery_window_summary.end_at,
              team_timezone,
            )}
          </p>
        </div>
      )}

      {/* Last updated */}
      {latestEntry && (
        <p className="text-xs text-white/30">
          Last updated:{" "}
          {formatLastUpdated(latestEntry.occurred_at, team_timezone)}
        </p>
      )}
    </div>
  );
}
