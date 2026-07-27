import { useContext } from "react";

import { StepSequenceContext } from "./StepSequenceContext";

export const useStepSequence = () => {
  const context = useContext(StepSequenceContext);
  if (!context) {
    throw new Error(
      "useStepSequence must be used within a StepSequenceProvider.",
    );
  }
  return context;
};
