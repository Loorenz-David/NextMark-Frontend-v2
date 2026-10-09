import { useCallback, useEffect, useRef, useState } from "react";
import type { ClientFormRedirect } from "../domain/clientFormRedirect";
import {
  REDIRECT_COUNTDOWN_MS,
  createSubmitRedirectCountdown,
  type RedirectCountdownEnv,
  type SubmitRedirectCountdown,
  type SubmitRedirectState,
} from "../domain/submitRedirectCountdown";

const browserEnv: RedirectCountdownEnv = {
  // Wall-clock rather than `performance.now()`: the time that passes while a
  // phone is locked must count towards the deadline.
  now: () => Date.now(),
  isHidden: () => document.visibilityState === "hidden",
  // `replace`, so Back does not return the customer to a spent form.
  navigate: (href) => window.location.replace(href),
  setInterval: (callback, ms) => window.setInterval(callback, ms),
  clearInterval: (handle) => window.clearInterval(handle),
  setTimeout: (callback, ms) => window.setTimeout(callback, ms),
  clearTimeout: (handle) => window.clearTimeout(handle),
  subscribe: ({ onResume, onPageShow }) => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") onResume();
    };
    const handlePageShow = (event: PageTransitionEvent) =>
      onPageShow(event.persisted);

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", onResume);
    window.addEventListener("pageshow", handlePageShow);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", onResume);
      window.removeEventListener("pageshow", handlePageShow);
    };
  },
};

const INITIAL_STATE: SubmitRedirectState = {
  phase: "counting",
  secondsLeft: Math.ceil(REDIRECT_COUNTDOWN_MS / 1000),
};

/** Runs the post-submit countdown for as long as the caller is mounted. */
export const useSubmitRedirectCountdown = (redirect: ClientFormRedirect) => {
  const [state, setState] = useState<SubmitRedirectState>(INITIAL_STATE);
  const countdownRef = useRef<SubmitRedirectCountdown | null>(null);

  useEffect(() => {
    const countdown = createSubmitRedirectCountdown({
      href: redirect.href,
      env: browserEnv,
      onChange: setState,
    });
    countdownRef.current = countdown;
    countdown.start();

    return () => {
      countdown.dispose();
      countdownRef.current = null;
    };
  }, [redirect.href]);

  const cancel = useCallback(() => countdownRef.current?.cancel(), []);
  const markFollowed = useCallback(
    () => countdownRef.current?.markFollowed(),
    [],
  );

  return { ...state, cancel, markFollowed };
};
