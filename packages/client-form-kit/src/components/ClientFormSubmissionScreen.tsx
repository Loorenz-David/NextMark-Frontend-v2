import { AnimatePresence, motion } from "framer-motion";
import { useClientForm } from "../context/useClientForm";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { driveOnMainThread } from "../motion/driveOnMainThread";

const RING_RADIUS = 36;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const COPY = {
  submitting: {
    title: "Skickar dina uppgifter…",
    body: "Det tar bara några sekunder.",
  },
  submitted: {
    title: "Tack!",
    body: "Vi har tagit emot dina uppgifter.",
  },
} as const;

/**
 * Covers the form from the tap on Skicka until the host moves on. The spinner
 * and the confirmation are one screen, so the spinner can turn into the check
 * mark instead of the page cutting to a different one.
 *
 * It sits over the form rather than replacing it: a rejected submission fades
 * this away and the customer is back where they were, answers intact.
 */
export const ClientFormSubmissionScreen = () => {
  const { isSubmitting, isSubmitted } = useClientForm();
  const prefersReducedMotion = usePrefersReducedMotion();
  const isVisible = isSubmitting || isSubmitted;
  const phase = isSubmitted ? "submitted" : "submitting";
  const fade = prefersReducedMotion ? { duration: 0 } : { duration: 0.25 };

  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.div
          key="client-form-submission"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onUpdate={driveOnMainThread}
          transition={fade}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--paper)] px-6"
          style={{
            paddingTop: "env(safe-area-inset-top)",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          <div className="flex max-w-sm flex-col items-center gap-6 text-center">
            <div className="relative h-20 w-20" aria-hidden="true">
              <AnimatePresence initial={false}>
                {isSubmitted ? (
                  <motion.div
                    key="check"
                    onUpdate={driveOnMainThread}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 260, damping: 20 }
                    }
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-ink)]"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-9 w-9"
                    >
                      <motion.path
                        d="M5 12.5l4.5 4.5L19 7.5"
                        initial={{ pathLength: prefersReducedMotion ? 1 : 0 }}
                        animate={{ pathLength: 1 }}
                        transition={
                          prefersReducedMotion
                            ? { duration: 0 }
                            : { delay: 0.18, duration: 0.4, ease: "easeOut" }
                        }
                      />
                    </svg>
                  </motion.div>
                ) : (
                  <motion.div
                    key="spinner"
                    exit={{ scale: 0.85, opacity: 0 }}
                    onUpdate={driveOnMainThread}
                    transition={fade}
                    className="absolute inset-0"
                  >
                    {/* A CSS spin rather than a motion one: the `initial={false}`
                        above settles first-render motion values at their target,
                        which would leave a motion rotation frozen at 360°. The
                        spin is the only sign of progress, so it keeps turning
                        even with reduced motion. */}
                    <svg
                      viewBox="0 0 80 80"
                      fill="none"
                      className="h-full w-full animate-spin"
                    >
                      <circle
                        cx="40"
                        cy="40"
                        r={RING_RADIUS}
                        strokeWidth="4"
                        className="stroke-[var(--rule)]"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r={RING_RADIUS}
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={`${RING_CIRCUMFERENCE * 0.28} ${RING_CIRCUMFERENCE}`}
                        className="stroke-[var(--accent)]"
                      />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div role="status" aria-live="polite" className="min-h-[4.5rem]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={phase}
                  initial={{ y: prefersReducedMotion ? 0 : 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: prefersReducedMotion ? 0 : -8, opacity: 0 }}
                  onUpdate={driveOnMainThread}
                  transition={fade}
                  className="space-y-2"
                >
                  <p className="text-[length:var(--cf-heading)] text-[var(--ink)]">
                    {COPY[phase].title}
                  </p>
                  <p className="text-[length:var(--cf-body)] text-[var(--ink-soft)]">
                    {COPY[phase].body}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
