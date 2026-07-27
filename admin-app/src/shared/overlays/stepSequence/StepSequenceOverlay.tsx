import { AnimatePresence, motion } from "framer-motion";

import { StepIndicator } from "./StepIndicator";
import type { StepSequenceViewState } from "./useStepSequenceRunner";

type StepSequenceOverlayProps = {
  state: StepSequenceViewState;
  onTap: () => void;
  onClose: () => void;
};

const resolveLabel = (state: StepSequenceViewState): string => {
  const step = state.steps[state.currentIndex];
  if (!step) return "";
  if (state.status === "succeeded") return step.successLabel;
  if (state.status === "failed") {
    return step.errorLabel ?? "Something went wrong";
  }
  return step.runningLabel;
};

/**
 * Presentational shell for the step sequence. It intentionally does not use
 * `FeaturePopupShell` — there must be no backdrop dismiss and no Escape-to-close
 * while a step is running. Tapping anywhere either speeds the current step up
 * (once its request settled) or, when everything is done, closes the overlay.
 */
export const StepSequenceOverlay = ({
  state,
  onTap,
  onClose,
}: StepSequenceOverlayProps) => {
  const label = resolveLabel(state);
  const step = state.steps[state.currentIndex];
  const canSkipHint = state.settled && state.status === "running";

  return (
    <AnimatePresence>
      {state.active ? (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          role="dialog"
          aria-modal="true"
          aria-live="polite"
          onClick={onTap}
        >
          <div className="popup-overlay absolute inset-0" aria-hidden />

          <motion.div
            className="relative z-10 flex w-[min(420px,94vw)] flex-col items-center gap-6 rounded-3xl bg-[var(--color-page)] px-8 py-10 text-center text-[var(--color-text)] shadow-xl"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {state.title ? (
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                {state.title}
              </p>
            ) : null}

            <StepIndicator status={state.status} />

            <div className="flex min-h-[3.5rem] flex-col items-center gap-1">
              <AnimatePresence mode="wait">
                <motion.p
                  key={`${state.currentIndex}-${state.status}`}
                  className="text-base font-semibold text-[var(--color-text)]"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  {label}
                </motion.p>
              </AnimatePresence>
              {step?.detail ? (
                <p className="text-sm text-[var(--color-muted)]">
                  {step.detail}
                </p>
              ) : null}
            </div>

            {state.steps.length > 1 ? (
              <div className="flex items-center gap-2">
                {state.steps.map((sequenceStep, index) => {
                  const isPast =
                    index < state.currentIndex ||
                    (index === state.currentIndex &&
                      state.status === "succeeded");
                  const isFailed =
                    index === state.currentIndex && state.status === "failed";
                  const isCurrent = index === state.currentIndex;
                  return (
                    <span
                      key={sequenceStep.id}
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: isCurrent ? 22 : 8,
                        backgroundColor: isFailed
                          ? "var(--color-warning)"
                          : isPast
                            ? "var(--color-success-solid)"
                            : isCurrent
                              ? "var(--color-border-accent)"
                              : "var(--color-border)",
                      }}
                    />
                  );
                })}
              </div>
            ) : null}

            <div className="flex min-h-[1.25rem] items-center justify-center">
              {state.dismissible ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onClose();
                  }}
                  className="rounded-full bg-[var(--color-text)] px-6 py-2 text-sm font-semibold text-[var(--color-page)] transition hover:opacity-90"
                >
                  {state.completed ? "Done" : "Close"}
                </button>
              ) : canSkipHint ? (
                <motion.span
                  className="text-xs text-[var(--color-muted)]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  Tap to continue
                </motion.span>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
