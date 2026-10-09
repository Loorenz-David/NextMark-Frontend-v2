import { motion } from "framer-motion";
import type { ClientFormRedirect } from "../domain/clientFormRedirect";
import { REDIRECT_COUNTDOWN_MS } from "../domain/submitRedirectCountdown";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { useSubmitRedirectCountdown } from "../hooks/useSubmitRedirectCountdown";
import { driveOnMainThread } from "../motion/driveOnMainThread";
import { ClientFormRedirectLink } from "./ClientFormRedirectLink";

type Props = {
  redirect: ClientFormRedirect;
};

/**
 * Shown under the confirmation when the team has a page to send the customer
 * to: names the destination, counts down, and always offers a link to tap —
 * the automatic redirect is a convenience, the link is what is guaranteed.
 */
export const ClientFormRedirectNotice = ({ redirect }: Props) => {
  const { phase, secondsLeft, cancel, markFollowed } =
    useSubmitRedirectCountdown(redirect);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { host } = redirect;

  const message =
    phase === "counting"
      ? `Du skickas vidare till ${host} om ${secondsLeft} s.`
      : phase === "navigating"
        ? `Öppnar ${host}…`
        : phase === "stalled"
          ? `Sidan öppnades inte automatiskt. Tryck för att fortsätta till ${host}.`
          : null;

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {/* Hidden from screen readers: the confirmation's live region already
          announces the destination once, and ticking seconds would be read out
          every second. */}
      {message ? (
        <p
          aria-hidden="true"
          className="text-[length:var(--cf-body)] text-[var(--ink-soft)]"
        >
          {message}
        </p>
      ) : null}

      {phase === "counting" && !prefersReducedMotion ? (
        <div
          aria-hidden="true"
          className="h-0.5 w-40 overflow-hidden rounded-full bg-[var(--rule)]"
        >
          <motion.div
            className="h-full origin-left bg-[var(--accent)]"
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            onUpdate={driveOnMainThread}
            transition={{ duration: REDIRECT_COUNTDOWN_MS / 1000, ease: "linear" }}
          />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <ClientFormRedirectLink
          redirect={redirect}
          label={phase === "counting" ? "Fortsätt nu" : undefined}
          variant={phase === "navigating" ? "ghost" : "primary"}
          onFollow={markFollowed}
        />
        {phase === "counting" ? (
          <button
            type="button"
            onClick={cancel}
            className="min-h-[var(--cf-tap)] cursor-pointer rounded-[var(--radius)] border border-[var(--rule-strong)] bg-transparent px-6 py-[var(--cf-action-py)] text-[length:var(--cf-action)] font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)] transition-colors hover:bg-[var(--paper-sunken)] hover:text-[var(--ink)]"
          >
            Stanna här
          </button>
        ) : null}
      </div>
    </div>
  );
};
