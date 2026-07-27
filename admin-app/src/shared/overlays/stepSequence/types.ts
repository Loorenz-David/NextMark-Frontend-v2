export type StepStatus = "pending" | "running" | "succeeded" | "failed";

/**
 * A single unit of visible, paced work in a sequence overlay.
 *
 * The overlay owns the pacing: it renders the running animation for at least
 * `minRunMs` (capping fast requests to a readable minimum), then reveals the
 * result and holds it for `holdMs` before advancing. `run` is the request the
 * step "listens for" — its promise gates when the result may be revealed.
 */
export interface SequenceStep<T = unknown> {
  id: string;
  /** Copy shown while the request is in flight. */
  runningLabel: string;
  /** Copy shown once the request resolves successfully. */
  successLabel: string;
  /** Copy shown when the request rejects. Falls back to a generic message. */
  errorLabel?: string;
  /** Optional secondary line rendered under the label. */
  detail?: string;
  /** The request this step represents. Rejection marks the step as failed. */
  run: () => Promise<T>;
  /** Minimum time the running animation stays on screen. Default 900ms. */
  minRunMs?: number;
  /** Standby time on the result state before advancing. Default 650ms. */
  holdMs?: number;
  /**
   * When true, a rejected `run` marks the step failed but the sequence keeps
   * going. When false (default), a failure halts the sequence and the overlay
   * becomes dismissible.
   */
  optional?: boolean;
}

export interface StepOutcome {
  id: string;
  status: "succeeded" | "failed";
  error?: unknown;
}

export interface SequenceRunResult {
  /** True when every step ran to completion without a blocking failure. */
  completed: boolean;
  outcomes: StepOutcome[];
}

export interface StepSequenceConfig {
  title?: string;
  steps: SequenceStep[];
  /** Auto-close after the final step's hold. Default true. */
  autoCloseOnComplete?: boolean;
}
