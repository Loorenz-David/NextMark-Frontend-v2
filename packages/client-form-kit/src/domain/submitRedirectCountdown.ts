/**
 * The countdown between the confirmation and the automatic redirect.
 *
 * Kept free of React and of the DOM — everything it touches comes in through
 * `RedirectCountdownEnv` — because its job is to behave correctly in the
 * situations a phone puts it in, and those are only testable with a clock and
 * a page lifecycle that the test controls.
 *
 * What it guards against:
 * - Mobile browsers pause or throttle timers while the tab is in the background
 *   or the screen is locked. Time is measured against a wall-clock deadline, so
 *   a delayed tick still knows the countdown is over; the interval only drives
 *   the displayed seconds.
 * - A deadline that passes while the page is hidden waits for it to be visible
 *   again: the customer is never sent somewhere they did not see coming.
 * - A navigation that never happens (blocked by an in-app browser) turns into
 *   `stalled`, so the screen can ask for a tap instead of sitting on "opening…".
 * - A page restored from the back/forward cache lands in `manual`: the customer
 *   came back on purpose and must not be bounced out again.
 */

export type SubmitRedirectPhase =
  /** Counting down; navigates when the deadline passes on a visible page. */
  | "counting"
  /** Navigation requested, waiting for the page to unload. */
  | "navigating"
  /** The page outlived the navigation; it was most likely blocked. */
  | "stalled"
  /** Restored from the back/forward cache; only a tap navigates now. */
  | "manual"
  /** The customer stopped the countdown. */
  | "cancelled";

export type SubmitRedirectState = {
  phase: SubmitRedirectPhase;
  secondsLeft: number;
};

export type RedirectCountdownEnv = {
  now: () => number;
  isHidden: () => boolean;
  navigate: (href: string) => void;
  setInterval: (callback: () => void, ms: number) => number;
  clearInterval: (handle: number) => void;
  setTimeout: (callback: () => void, ms: number) => number;
  clearTimeout: (handle: number) => void;
  /** Page lifecycle; returns the unsubscribe. */
  subscribe: (handlers: {
    /** The page may have become visible or regained focus. */
    onResume: () => void;
    onPageShow: (persisted: boolean) => void;
  }) => () => void;
};

export const REDIRECT_COUNTDOWN_MS = 4000;
const TICK_MS = 250;
/** How long the page may outlive a navigation before it counts as blocked. */
export const REDIRECT_STALL_MS = 2500;

type Options = {
  href: string;
  env: RedirectCountdownEnv;
  onChange: (state: SubmitRedirectState) => void;
  durationMs?: number;
  stallMs?: number;
};

export type SubmitRedirectCountdown = {
  start: () => void;
  cancel: () => void;
  /** The customer tapped the link; the browser is already navigating. */
  markFollowed: () => void;
  dispose: () => void;
  getState: () => SubmitRedirectState;
};

export const createSubmitRedirectCountdown = ({
  href,
  env,
  onChange,
  durationMs = REDIRECT_COUNTDOWN_MS,
  stallMs = REDIRECT_STALL_MS,
}: Options): SubmitRedirectCountdown => {
  let state: SubmitRedirectState = {
    phase: "counting",
    secondsLeft: Math.ceil(durationMs / 1000),
  };
  let deadline = 0;
  let intervalHandle: number | null = null;
  let stallHandle: number | null = null;
  let unsubscribe: (() => void) | null = null;
  let hasNavigated = false;

  const setState = (next: SubmitRedirectState) => {
    if (next.phase === state.phase && next.secondsLeft === state.secondsLeft) {
      return;
    }
    state = next;
    onChange(state);
  };

  const stopTicking = () => {
    if (intervalHandle !== null) {
      env.clearInterval(intervalHandle);
      intervalHandle = null;
    }
  };

  const stopStallTimer = () => {
    if (stallHandle !== null) {
      env.clearTimeout(stallHandle);
      stallHandle = null;
    }
  };

  const awaitUnload = () => {
    stopTicking();
    stopStallTimer();
    stallHandle = env.setTimeout(() => {
      stallHandle = null;
      if (state.phase === "navigating") {
        setState({ phase: "stalled", secondsLeft: 0 });
      }
    }, stallMs);
  };

  const navigate = () => {
    // Fired once: a second `location.replace` could race the first and, on
    // some browsers, cancel the navigation already in flight.
    if (hasNavigated) return;
    hasNavigated = true;
    setState({ phase: "navigating", secondsLeft: 0 });
    awaitUnload();
    env.navigate(href);
  };

  const tick = () => {
    if (state.phase !== "counting") return;

    const remaining = deadline - env.now();
    if (remaining > 0) {
      setState({ phase: "counting", secondsLeft: Math.ceil(remaining / 1000) });
      return;
    }

    if (env.isHidden()) {
      setState({ phase: "counting", secondsLeft: 0 });
      return;
    }

    navigate();
  };

  const handlePageShow = (persisted: boolean) => {
    if (persisted) {
      stopTicking();
      stopStallTimer();
      setState({ phase: "manual", secondsLeft: 0 });
      return;
    }
    tick();
  };

  return {
    start: () => {
      if (unsubscribe) return;
      deadline = env.now() + durationMs;
      intervalHandle = env.setInterval(tick, TICK_MS);
      unsubscribe = env.subscribe({ onResume: tick, onPageShow: handlePageShow });
      onChange(state);
    },
    cancel: () => {
      if (state.phase !== "counting") return;
      stopTicking();
      setState({ phase: "cancelled", secondsLeft: 0 });
    },
    markFollowed: () => {
      hasNavigated = true;
      setState({ phase: "navigating", secondsLeft: 0 });
      awaitUnload();
    },
    dispose: () => {
      stopTicking();
      stopStallTimer();
      unsubscribe?.();
      unsubscribe = null;
    },
    getState: () => state,
  };
};
