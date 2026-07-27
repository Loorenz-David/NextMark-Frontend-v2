import type { SequenceStep, StepStatus } from "../types";

export type SettledStepStatus = Extract<StepStatus, "succeeded" | "failed">;

export const DEFAULT_MIN_RUN_MS = 900;
export const DEFAULT_HOLD_MS = 650;

export const resolveMinRunMs = (
  step: Pick<SequenceStep, "minRunMs">,
): number =>
  typeof step.minRunMs === "number" && step.minRunMs >= 0
    ? step.minRunMs
    : DEFAULT_MIN_RUN_MS;

export const resolveHoldMs = (step: Pick<SequenceStep, "holdMs">): number =>
  typeof step.holdMs === "number" && step.holdMs >= 0
    ? step.holdMs
    : DEFAULT_HOLD_MS;

/**
 * Remaining running-animation time once a request has settled: the floor
 * (`minMs`) minus however long the request already took. Never negative.
 */
export const resolveRemainingMs = (
  startedAt: number,
  now: number,
  minMs: number,
): number => Math.max(0, minMs - Math.max(0, now - startedAt));

export const resolveResultStatus = (settledOk: boolean): SettledStepStatus =>
  settledOk ? "succeeded" : "failed";

/**
 * A failed step halts the sequence unless it was declared optional.
 */
export const isBlockingFailure = (
  step: Pick<SequenceStep, "optional">,
  status: StepStatus,
): boolean => status === "failed" && !step.optional;
