import { AnimatePresence, motion } from "framer-motion";

import type { StepStatus } from "./types";

type StepIndicatorProps = {
  status: StepStatus;
};

const SIZE = 84;
const STROKE = 5;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * A single circular indicator that spins while a step runs and morphs into a
 * checkmark or cross when the step resolves. Colours are theme tokens, so light
 * and dark are handled by the surrounding `data-theme`.
 */
export const StepIndicator = ({ status }: StepIndicatorProps) => {
  const isRunning = status === "running" || status === "pending";
  const isSuccess = status === "succeeded";

  const ringColor = isSuccess
    ? "var(--color-success-solid)"
    : status === "failed"
      ? "var(--color-warning)"
      : "var(--color-border-accent)";

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: SIZE, height: SIZE }}
    >
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="absolute inset-0"
      >
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={STROKE}
          opacity={0.35}
        />
        {isRunning ? (
          <motion.circle
            key="spinner"
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={ringColor}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={`${CIRCUMFERENCE * 0.28} ${CIRCUMFERENCE}`}
            style={{ transformOrigin: "center" }}
            initial={{ rotate: 0 }}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 0.9, ease: "linear", repeat: Infinity }}
          />
        ) : (
          <motion.circle
            key="result-ring"
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={ringColor}
            strokeWidth={STROKE}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0.4 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            style={{ transformOrigin: "center", rotate: -90 }}
          />
        )}
      </svg>

      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.svg
            key="check"
            width={40}
            height={40}
            viewBox="0 0 40 40"
            className="relative"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: "spring", stiffness: 480, damping: 26 }}
          >
            <motion.path
              d="M11 20.5 L17.5 27 L29 14"
              fill="none"
              stroke="var(--color-success-solid)"
              strokeWidth={4}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3, ease: "easeOut", delay: 0.05 }}
            />
          </motion.svg>
        ) : status === "failed" ? (
          <motion.svg
            key="cross"
            width={40}
            height={40}
            viewBox="0 0 40 40"
            className="relative"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: "spring", stiffness: 480, damping: 26 }}
          >
            <motion.path
              d="M14 14 L26 26 M26 14 L14 26"
              fill="none"
              stroke="var(--color-warning)"
              strokeWidth={4}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.28, ease: "easeOut", delay: 0.05 }}
            />
          </motion.svg>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
