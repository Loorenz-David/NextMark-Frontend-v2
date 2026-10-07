/**
 * The gate reads every rule in order and then closes on one confirm stage,
 * where the terms, the marketing opt-in and the submit action live — so the
 * customer cannot reach the commit without passing the rules first.
 */
export type RulesGateSequenceState = {
  activeIndex: number;
  currentPosition: number;
  isFirst: boolean;
  isLast: boolean;
  /** True on the stage after the last rule. */
  isConfirmStage: boolean;
  progress: number;
  ruleCount: number;
  /** Rules plus the confirm stage; zero when there are no rules to read. */
  stageCount: number;
};

const normalizeRuleCount = (ruleCount: number): number =>
  Math.max(0, Math.trunc(ruleCount));

const getStageCount = (ruleCount: number): number => {
  const normalizedCount = normalizeRuleCount(ruleCount);
  return normalizedCount === 0 ? 0 : normalizedCount + 1;
};

export const clampRulesGateIndex = (
  requestedIndex: number,
  ruleCount: number,
): number => {
  const stageCount = getStageCount(ruleCount);
  if (stageCount === 0) return 0;
  return Math.min(Math.max(0, Math.trunc(requestedIndex)), stageCount - 1);
};

export const getRulesGateSequenceState = (
  requestedIndex: number,
  ruleCount: number,
): RulesGateSequenceState => {
  const normalizedCount = normalizeRuleCount(ruleCount);
  const stageCount = getStageCount(normalizedCount);
  const activeIndex = clampRulesGateIndex(requestedIndex, normalizedCount);
  const currentPosition = stageCount === 0 ? 0 : activeIndex + 1;
  const isLast = stageCount > 0 && activeIndex === stageCount - 1;

  return {
    activeIndex,
    currentPosition,
    isFirst: activeIndex === 0,
    isLast,
    isConfirmStage: isLast,
    progress: stageCount === 0 ? 0 : currentPosition / stageCount,
    ruleCount: normalizedCount,
    stageCount,
  };
};

export const getPreviousRulesGateIndex = (
  activeIndex: number,
  ruleCount: number,
): number => clampRulesGateIndex(activeIndex - 1, ruleCount);

export const getNextRulesGateIndex = (
  activeIndex: number,
  ruleCount: number,
): number => clampRulesGateIndex(activeIndex + 1, ruleCount);
