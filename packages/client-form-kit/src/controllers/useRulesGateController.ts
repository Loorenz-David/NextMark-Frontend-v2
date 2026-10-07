import { useCallback, useEffect, useRef, useState } from "react";
import { useClientForm } from "../context/useClientForm";
import {
  getNextRulesGateIndex,
  getPreviousRulesGateIndex,
  getRulesGateSequenceState,
} from "../domain/rulesGateSequence";

export type RulesGateDirection = -1 | 1;

/**
 * Owns the reader's transient sequence state. It deliberately remains mounted
 * while the sheet is closed, so returning to the form and reopening resumes
 * the rule the customer last viewed.
 */
export const useRulesGateController = () => {
  const {
    config,
    isRulesGateOpen,
    isSubmitting,
    confirmAndSubmit,
    dismissRulesGate,
  } = useClientForm();
  const [requestedIndex, setRequestedIndex] = useState(0);
  const [direction, setDirection] = useState<RulesGateDirection>(1);
  const [isCompleting, setIsCompleting] = useState(false);
  const completionStartedRef = useRef(false);

  const ruleCount = config.rules.length;
  const sequence = getRulesGateSequenceState(requestedIndex, ruleCount);
  const {
    activeIndex,
    currentPosition,
    isFirst,
    isLast,
    progress,
    stageCount,
  } = sequence;
  // Null on the confirm stage, which follows the last rule.
  const activeRule = config.rules[activeIndex] ?? null;

  // A refreshed configuration may contain fewer rules. Keep the persisted
  // position valid without resetting a customer who is still in this session.
  useEffect(() => {
    if (requestedIndex === activeIndex) return;
    setDirection(-1);
    setRequestedIndex(activeIndex);
  }, [activeIndex, requestedIndex]);

  const previous = useCallback(() => {
    if (activeIndex === 0 || isSubmitting || isCompleting) return;
    setDirection(-1);
    setRequestedIndex(getPreviousRulesGateIndex(activeIndex, ruleCount));
  }, [activeIndex, isCompleting, isSubmitting, ruleCount]);

  const advance = useCallback(async () => {
    if (stageCount === 0 || isSubmitting || isCompleting) return;

    if (!isLast) {
      setDirection(1);
      setRequestedIndex(getNextRulesGateIndex(activeIndex, ruleCount));
      return;
    }

    // The ref closes the small gap before React commits isCompleting, preventing
    // a fast double activation from issuing two submit requests.
    if (completionStartedRef.current) return;
    completionStartedRef.current = true;
    setIsCompleting(true);
    try {
      await confirmAndSubmit();
    } finally {
      completionStartedRef.current = false;
      setIsCompleting(false);
    }
  }, [
    activeIndex,
    confirmAndSubmit,
    isCompleting,
    isLast,
    isSubmitting,
    ruleCount,
    stageCount,
  ]);

  return {
    activeIndex,
    activeRule,
    advance,
    direction,
    dismiss: dismissRulesGate,
    isBusy: isSubmitting || isCompleting,
    isFirst,
    isLast,
    isOpen: isRulesGateOpen,
    previous,
    progress,
    ruleCount,
    rules: config.rules,
    stageCount,
    currentPosition,
  };
};
