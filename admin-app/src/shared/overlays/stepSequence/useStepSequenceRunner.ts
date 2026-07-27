import { useCallback, useEffect, useRef, useState } from "react";

import {
  isBlockingFailure,
  resolveHoldMs,
  resolveMinRunMs,
  resolveRemainingMs,
  resolveResultStatus,
} from "./domain";
import type {
  SequenceRunResult,
  SequenceStep,
  StepOutcome,
  StepSequenceConfig,
  StepStatus,
} from "./types";

export interface StepSequenceViewState {
  active: boolean;
  title?: string;
  steps: SequenceStep[];
  currentIndex: number;
  /** Status of the current step: `running` until its result is revealed. */
  status: StepStatus;
  /** The current step's request has resolved — tap-to-skip is now allowed. */
  settled: boolean;
  /** The whole sequence has ended (completed or halted on a failure). */
  finished: boolean;
  /** Reached the last step without a blocking failure. */
  completed: boolean;
  /** The user may now close the overlay (nothing is in flight). */
  dismissible: boolean;
}

const INITIAL_STATE: StepSequenceViewState = {
  active: false,
  steps: [],
  currentIndex: 0,
  status: "pending",
  settled: false,
  finished: false,
  completed: false,
  dismissible: false,
};

export interface StepSequenceRunner {
  state: StepSequenceViewState;
  run: (config: StepSequenceConfig) => Promise<SequenceRunResult>;
  /** Speed the current step up (only once its request settled). */
  handleTap: () => void;
  /** Dismiss the overlay (only when nothing is in flight). */
  handleClose: () => void;
}

/**
 * Drives a step-sequence overlay with an imperative async loop so pacing rules
 * read top-to-bottom: run the request, cap it to a minimum visible time, reveal
 * the result, hold, advance. Tap collapses the remaining waits, but only after
 * the request has settled, so an in-flight request can never be skipped.
 */
export const useStepSequenceRunner = (): StepSequenceRunner => {
  const [state, setState] = useState<StepSequenceViewState>(INITIAL_STATE);

  const settledRef = useRef(false);
  const dismissibleRef = useRef(false);
  const skipRef = useRef<(() => void) | null>(null);
  const resolveRef = useRef<((result: SequenceRunResult) => void) | null>(null);
  const resultRef = useRef<SequenceRunResult>({
    completed: false,
    outcomes: [],
  });
  const runningRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(
    () => () => {
      mountedRef.current = false;
      skipRef.current?.();
    },
    [],
  );

  const waitSkippable = useCallback(
    (ms: number) =>
      new Promise<void>((resolve) => {
        if (ms <= 0) {
          resolve();
          return;
        }
        const timeout = setTimeout(() => {
          skipRef.current = null;
          resolve();
        }, ms);
        skipRef.current = () => {
          clearTimeout(timeout);
          skipRef.current = null;
          resolve();
        };
      }),
    [],
  );

  const finalize = useCallback(() => {
    const resolve = resolveRef.current;
    const result = resultRef.current;
    resolveRef.current = null;
    runningRef.current = false;
    settledRef.current = false;
    dismissibleRef.current = false;
    skipRef.current = null;
    if (mountedRef.current) {
      setState(INITIAL_STATE);
    }
    resolve?.(result);
  }, []);

  const run = useCallback(
    (config: StepSequenceConfig) =>
      new Promise<SequenceRunResult>((resolve) => {
        const steps = config.steps;
        resolveRef.current = resolve;
        resultRef.current = { completed: false, outcomes: [] };
        runningRef.current = true;
        settledRef.current = false;
        dismissibleRef.current = false;

        if (steps.length === 0) {
          resultRef.current = { completed: true, outcomes: [] };
          finalize();
          return;
        }

        setState({
          active: true,
          title: config.title,
          steps,
          currentIndex: 0,
          status: "running",
          settled: false,
          finished: false,
          completed: false,
          dismissible: false,
        });

        void (async () => {
          const outcomes: StepOutcome[] = [];

          for (let index = 0; index < steps.length; index += 1) {
            const step = steps[index];
            settledRef.current = false;
            setState((prev) => ({
              ...prev,
              currentIndex: index,
              status: "running",
              settled: false,
            }));

            const minRunMs = resolveMinRunMs(step);
            const startedAt = Date.now();
            let ok = true;
            let error: unknown;
            try {
              await step.run();
            } catch (caught) {
              ok = false;
              error = caught;
            }

            settledRef.current = true;
            setState((prev) => ({ ...prev, settled: true }));

            // Cap the running animation to its minimum visible time. Now that the
            // request settled, a tap may collapse whatever remains.
            await waitSkippable(
              resolveRemainingMs(startedAt, Date.now(), minRunMs),
            );

            const status = resolveResultStatus(ok);
            outcomes.push({ id: step.id, status, error });
            setState((prev) => ({ ...prev, status }));

            if (isBlockingFailure(step, status)) {
              resultRef.current = { completed: false, outcomes };
              dismissibleRef.current = true;
              setState((prev) => ({
                ...prev,
                finished: true,
                completed: false,
                dismissible: true,
              }));
              return;
            }

            await waitSkippable(resolveHoldMs(step));
          }

          resultRef.current = { completed: true, outcomes };
          if (config.autoCloseOnComplete === false) {
            dismissibleRef.current = true;
            setState((prev) => ({
              ...prev,
              finished: true,
              completed: true,
              dismissible: true,
            }));
            return;
          }
          finalize();
        })();
      }),
    [finalize, waitSkippable],
  );

  const handleTap = useCallback(() => {
    if (dismissibleRef.current) {
      finalize();
      return;
    }
    if (!settledRef.current) return;
    skipRef.current?.();
  }, [finalize]);

  const handleClose = useCallback(() => {
    if (!dismissibleRef.current) return;
    finalize();
  }, [finalize]);

  return { state, run, handleTap, handleClose };
};
