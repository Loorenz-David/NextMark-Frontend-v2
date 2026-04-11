import { useEffect, useState } from "react";
import { fetchOrderTracking } from "../../../api/orderTracking.api";
import type { TrackingPageState } from "../domain/orderTracking.types";
import { TrackingSummaryCard } from "../components/TrackingSummaryCard";
import { TrackingTimeline } from "../components/TrackingTimeline";
import { PublicCenteredState } from "../../../app/layout/PublicCenteredState";
import { PublicPageShell } from "../../../app/layout/PublicPageShell";

interface Props {
  token: string;
}

// ── Spinner ──────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#83ccb9"
      strokeWidth="2.2"
      strokeLinecap="round"
      className="h-7 w-7 animate-spin"
      aria-label="Loading"
    >
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}

// ── State screens ─────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <PublicCenteredState>
      <div className="flex flex-col items-center gap-3">
        <Spinner />
        <p className="text-sm text-white/46">Loading order status…</p>
      </div>
    </PublicCenteredState>
  );
}

function NotFoundScreen() {
  return (
    <PublicCenteredState
      icon={
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#83ccb9]/30 bg-[#83ccb9]/15 shadow-[0_0_24px_rgba(131,204,185,0.3)]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#83ccb9"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-7 w-7"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="11" />
            <line x1="11" y1="14" x2="11.01" y2="14" />
          </svg>
        </div>
      }
      title="Tracking link not found"
      description="We couldn't find an order for this tracking link. It may have been removed or the URL is incorrect."
    />
  );
}

function ErrorScreen() {
  return (
    <PublicCenteredState
      icon={
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.06]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-7 w-7"
            aria-hidden="true"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
      }
      title="Something went wrong"
      description="We were unable to load your order tracking information. Please try again later."
    />
  );
}

// ── Ready: main tracking content ──────────────────────────────────────────────
interface ReadyContentProps {
  data: import("../../../api/orderTracking.api").OrderTrackingData;
}

function OrderTrackingContent({ data }: ReadyContentProps) {
  return (
    <PublicPageShell>
      <main className="relative z-10 mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-10 sm:px-6">
        {/* Page header */}
        <header className="space-y-1 text-center">
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-white">
            Order Status
          </h1>
          <p className="text-sm text-white/46">
            Here's the latest information about your order.
          </p>
        </header>

        {/* Summary card */}
        <TrackingSummaryCard data={data} />

        {/* Timeline */}
        {data.timeline.length > 0 && (
          <TrackingTimeline
            timeline={data.timeline}
            teamTimezone={data.team_timezone}
            currentStatusLabel={data.current_status_label}
          />
        )}
      </main>
    </PublicPageShell>
  );
}

// ── Page component (state machine) ────────────────────────────────────────────
export function OrderTrackingPage({ token }: Props) {
  const [state, setState] = useState<TrackingPageState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    fetchOrderTracking(token)
      .then((data) => {
        if (!cancelled) setState({ status: "ready", data });
      })
      .catch((err: Error) => {
        if (cancelled) return;
        if (err.message === "not_found") {
          setState({ status: "not_found" });
        } else {
          setState({ status: "error" });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (state.status === "loading") return <LoadingScreen />;
  if (state.status === "not_found") return <NotFoundScreen />;
  if (state.status === "error") return <ErrorScreen />;

  return <OrderTrackingContent data={state.data} />;
}
