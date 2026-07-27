import { useMemo, type PropsWithChildren } from "react";

import { StepSequenceContext } from "./StepSequenceContext";
import { StepSequenceOverlay } from "./StepSequenceOverlay";
import { useStepSequenceRunner } from "./useStepSequenceRunner";

/**
 * Mounts the single, app-wide step-sequence overlay and exposes an imperative
 * `run(steps)` via context. Any feature can call `useStepSequence().run(...)`
 * to replay work as a paced, non-dismissible sequence.
 */
export const StepSequenceProvider = ({ children }: PropsWithChildren) => {
  const { state, run, handleTap, handleClose } = useStepSequenceRunner();

  const value = useMemo(() => ({ run }), [run]);

  return (
    <StepSequenceContext.Provider value={value}>
      {children}
      <StepSequenceOverlay
        state={state}
        onTap={handleTap}
        onClose={handleClose}
      />
    </StepSequenceContext.Provider>
  );
};
