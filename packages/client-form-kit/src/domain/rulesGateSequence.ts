export type RulesGateSequenceState = {
  activeIndex: number;
  currentPosition: number;
  isFirst: boolean;
  isLast: boolean;
  progress: number;
  ruleCount: number;
};

const normalizeRuleCount = (ruleCount: number): number =>
  Math.max(0, Math.trunc(ruleCount));

export const clampRulesGateIndex = (
  requestedIndex: number,
  ruleCount: number,
): number => {
  const normalizedCount = normalizeRuleCount(ruleCount);
  if (normalizedCount === 0) return 0;
  return Math.min(Math.max(0, Math.trunc(requestedIndex)), normalizedCount - 1);
};

export const getRulesGateSequenceState = (
  requestedIndex: number,
  ruleCount: number,
): RulesGateSequenceState => {
  const normalizedCount = normalizeRuleCount(ruleCount);
  const activeIndex = clampRulesGateIndex(requestedIndex, normalizedCount);
  const currentPosition = normalizedCount === 0 ? 0 : activeIndex + 1;

  return {
    activeIndex,
    currentPosition,
    isFirst: activeIndex === 0,
    isLast:
      normalizedCount > 0 && activeIndex === Math.max(0, normalizedCount - 1),
    progress:
      normalizedCount === 0 ? 0 : currentPosition / normalizedCount,
    ruleCount: normalizedCount,
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
