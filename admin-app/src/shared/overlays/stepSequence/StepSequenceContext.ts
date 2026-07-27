import { createContext } from "react";

import type { SequenceRunResult, StepSequenceConfig } from "./types";

export interface StepSequenceContextValue {
  run: (config: StepSequenceConfig) => Promise<SequenceRunResult>;
}

export const StepSequenceContext =
  createContext<StepSequenceContextValue | null>(null);
