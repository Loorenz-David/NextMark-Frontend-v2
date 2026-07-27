import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  useRulesGateController,
  type RulesGateDirection,
} from "../controllers/useRulesGateController";
import type { ClientFormRule } from "../domain/clientFormConfig.types";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { ClientFormSheet } from "./ClientFormSheet";
import { RuleReaderCard } from "./RuleReaderCard";
import { StepButton } from "./StepButton";

/**
 * Focus and scrolling happen when the keyed stage mounts, after the previous
 * stage's exit animation has completed.
 */
const AnimatedRuleStage = ({
  direction,
  prefersReducedMotion,
  rule,
}: {
  direction: RulesGateDirection;
  prefersReducedMotion: boolean;
  rule: ClientFormRule;
}) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    stageRef.current?.scrollIntoView({ block: "start" });
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
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.22, ease: [0.22, 1, 0.36, 1] }
      }
    >
      <RuleReaderCard rule={rule} headingRef={headingRef} />
    </motion.div>
  );
};

/**
 * Held between "Submit" and the actual POST. Rules are read in order and only
 * the last stage exposes the action that commits the order.
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
    ruleCount,
  } = useRulesGateController();
  const prefersReducedMotion = usePrefersReducedMotion();

  if (!activeRule) return null;

  return (
    <ClientFormSheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) dismiss();
      }}
      dismissible={false}
      blurBackdrop
      variant="fullscreen"
      title="Innan du bekräftar"
      description="Så fungerar din leverans."
      headerAside={
        <p
          aria-live="polite"
          className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]"
        >
          {currentPosition} of {ruleCount}
        </p>
      }
      headerBoundary={
        <div
          role="progressbar"
          aria-label="Läsförlopp för regler"
          aria-valuemin={1}
          aria-valuemax={ruleCount}
          aria-valuenow={currentPosition}
          aria-valuetext={`${currentPosition} of ${ruleCount}`}
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
            label="Föregående"
            variant="ghost"
            onClick={previous}
            disabled={isFirst || isBusy}
          />
          <StepButton
            label={
              isLast
                ? isBusy
                  ? "Skickar…"
                  : "Skicka beställning"
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
              key={activeRule.id}
              rule={activeRule}
              direction={direction}
              prefersReducedMotion={prefersReducedMotion}
            />
          </AnimatePresence>
        </div>
      </div>
    </ClientFormSheet>
  );
};
