import { useEffect, useRef, type ReactNode, type Ref } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  useRulesGateController,
  type RulesGateDirection,
} from "../controllers/useRulesGateController";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { ClientFormSheet } from "./ClientFormSheet";
import { RuleReaderCard } from "./RuleReaderCard";
import { RulesConfirmStage } from "./RulesConfirmStage";
import { driveOnMainThread } from "../motion/driveOnMainThread";
import { StepButton } from "./StepButton";

/**
 * Resets only the sheet body's scroll. `scrollIntoView` would also scroll the
 * overlay, which is scrollable for as long as the opening slide pushes the
 * panel past the bottom of a phone screen — the header jumped up and crawled
 * back while the sheet opened.
 */
const scrollNearestScrollPortToTop = (element: HTMLElement) => {
  for (let node = element.parentElement; node; node = node.parentElement) {
    const { overflowY } = window.getComputedStyle(node);
    if (overflowY === "auto" || overflowY === "scroll") {
      node.scrollTop = 0;
      return;
    }
  }
};

/**
 * Focus and scrolling happen when the keyed stage mounts, after the previous
 * stage's exit animation has completed.
 */
const AnimatedRuleStage = ({
  direction,
  prefersReducedMotion,
  children,
}: {
  direction: RulesGateDirection;
  prefersReducedMotion: boolean;
  children: (headingRef: Ref<HTMLHeadingElement>) => ReactNode;
}) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (stageRef.current) scrollNearestScrollPortToTop(stageRef.current);
    const frame = window.requestAnimationFrame(() => {
      headingRef.current?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <motion.div
      ref={stageRef}
      custom={direction}
      variants={{
        initial: (nextDirection: RulesGateDirection) => ({
          x: prefersReducedMotion ? 0 : nextDirection * 24,
          opacity: prefersReducedMotion ? 1 : 0,
        }),
        animate: { x: 0, opacity: 1 },
        exit: (nextDirection: RulesGateDirection) => ({
          x: prefersReducedMotion ? 0 : nextDirection * -24,
          opacity: prefersReducedMotion ? 1 : 0,
        }),
      }}
      initial="initial"
      animate="animate"
      exit="exit"
      onUpdate={driveOnMainThread}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.22, ease: [0.22, 1, 0.36, 1] }
      }
    >
      {children(headingRef)}
    </motion.div>
  );
};

/**
 * Opened by the last step's "Next" when the team has rules. Rules are read in
 * order, then a confirm stage collects consent and holds the only action that
 * commits the order.
 */
export const RulesGateSheet = () => {
  const {
    activeRule,
    advance,
    currentPosition,
    direction,
    dismiss,
    isBusy,
    isFirst,
    isLast,
    isOpen,
    previous,
    progress,
    rules,
    stageCount,
  } = useRulesGateController();
  const prefersReducedMotion = usePrefersReducedMotion();

  if (stageCount === 0) return null;

  return (
    <ClientFormSheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) dismiss();
      }}
      dismissible={false}
      blurBackdrop
      variant="fullscreen"
      // Rules differ in text and image length; a fixed height keeps the dialog
      // from resizing on every step.
      desktopHeight="fixed"
      title="Innan du skickar"
      description="Så går leveransen till."
      headerAside={
        <p
          aria-live="polite"
          className="text-[length:var(--cf-caption)] font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]"
        >
          {currentPosition} av {stageCount}
        </p>
      }
      headerBoundary={
        <div
          role="progressbar"
          aria-label="Förlopp"
          aria-valuemin={1}
          aria-valuemax={stageCount}
          aria-valuenow={currentPosition}
          aria-valuetext={`${currentPosition} av ${stageCount}`}
          className="h-1 overflow-hidden bg-[var(--rule)]"
        >
          <div
            aria-hidden="true"
            className="h-full bg-[var(--accent)] transition-[width] duration-200 ease-out motion-reduce:transition-none"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      }
      onBack={dismiss}
      backLabel="Tillbaka till formuläret"
      footer={
        <div className="flex items-center justify-between gap-3">
          <StepButton
            label="Tillbaka"
            variant="ghost"
            onClick={previous}
            disabled={isFirst || isBusy}
          />
          <StepButton
            label={
              isLast
                ? isBusy
                  ? "Skickar…"
                  : "Skicka"
                : "Nästa"
            }
            onClick={() => void advance()}
            disabled={isBusy}
          />
        </div>
      }
    >
      <div className="min-h-full">
        <div className="overflow-hidden">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <AnimatedRuleStage
              key={activeRule ? `rule-${activeRule.id}` : "confirm"}
              direction={direction}
              prefersReducedMotion={prefersReducedMotion}
            >
              {(headingRef) =>
                activeRule ? (
                  <RuleReaderCard rule={activeRule} headingRef={headingRef} />
                ) : (
                  <RulesConfirmStage rules={rules} headingRef={headingRef} />
                )
              }
            </AnimatedRuleStage>
          </AnimatePresence>
        </div>
      </div>
    </ClientFormSheet>
  );
};
