import {
  DEFAULT_HOLD_MS,
  DEFAULT_MIN_RUN_MS,
  isBlockingFailure,
  resolveHoldMs,
  resolveMinRunMs,
  resolveRemainingMs,
  resolveResultStatus,
} from "../stepSequencePacing";

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

export const runStepSequencePacingTests = () => {
  // Defaults apply when a step omits its timings.
  assert(
    resolveMinRunMs({}) === DEFAULT_MIN_RUN_MS,
    "min run falls back to the default",
  );
  assert(
    resolveHoldMs({}) === DEFAULT_HOLD_MS,
    "hold falls back to the default",
  );
  assert(
    resolveMinRunMs({ minRunMs: 250 }) === 250,
    "explicit min run is honored",
  );
  assert(resolveHoldMs({ holdMs: 0 }) === 0, "a zero hold is honored");

  // A fast request still owes the remainder of its minimum visible time.
  assert(
    resolveRemainingMs(1000, 1200, 900) === 700,
    "remaining time is the floor minus elapsed",
  );
  // A slow request has no remaining floor to wait out.
  assert(
    resolveRemainingMs(1000, 2500, 900) === 0,
    "a request slower than the floor leaves nothing to wait",
  );
  // Never negative even if the clock jumps.
  assert(
    resolveRemainingMs(2000, 1000, 900) === 900,
    "backwards elapsed clamps to the full floor",
  );

  assert(
    resolveResultStatus(true) === "succeeded",
    "a resolved request reveals success",
  );
  assert(
    resolveResultStatus(false) === "failed",
    "a rejected request reveals failure",
  );

  // Only non-optional failures halt the sequence.
  assert(
    isBlockingFailure({}, "failed"),
    "a required failed step blocks the sequence",
  );
  assert(
    !isBlockingFailure({ optional: true }, "failed"),
    "an optional failed step does not block",
  );
  assert(
    !isBlockingFailure({}, "succeeded"),
    "a succeeded step never blocks",
  );
};
