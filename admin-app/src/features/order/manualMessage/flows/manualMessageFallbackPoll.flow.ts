import { useEffect, useRef } from "react";

/** Offsets from the send, per the backend handoff. All terminal states stop the chain. */
const POLL_OFFSETS_MS = [2000, 5000, 10000, 20000];

type UseManualMessageFallbackPollOptions = {
  orderId: number | null | undefined;
  /** True while at least one tracked action is still PENDING. */
  hasPending: boolean;
  /** Bumped on every successful send so a second send gets its own chain. */
  pollToken: number;
  refresh: (orderId: number) => Promise<void> | void;
};

/**
 * Backstop for the realtime frames, which are best-effort and never replayed.
 *
 * Re-reads the order event history on a decaying schedule while a send is in
 * flight and stops the moment nothing is PENDING. If an action is still pending
 * after the last attempt the queue is backed up — the card keeps showing
 * "sending" rather than reporting an error.
 */
export const useManualMessageFallbackPoll = ({
  orderId,
  hasPending,
  pollToken,
  refresh,
}: UseManualMessageFallbackPollOptions) => {
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  useEffect(() => {
    if (typeof orderId !== "number" || !hasPending) return;

    let cancelled = false;
    const timers = POLL_OFFSETS_MS.map((offset) =>
      window.setTimeout(() => {
        if (cancelled) return;
        void refreshRef.current(orderId);
      }, offset),
    );

    return () => {
      cancelled = true;
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [hasPending, orderId, pollToken]);
};
