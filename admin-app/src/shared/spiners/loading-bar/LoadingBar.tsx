

import { useEffect, useState } from "react";

type LoadingBarProps = {
  /** Duration in seconds the bar should take to reach 100% */
  durationSeconds: number;
  /** Optional height in pixels (default: 6) */
  height?: number;
  /** Optional optimization start timestamp in epoch milliseconds */
  startedAt?: number | null;
  /** Optional starting progress cap (default: 0) */
  startCap?: number;
  /** Optional ending progress cap before completion (default: 100) */
  endCap?: number;
  /** Progress interpolation curve (default: linear) */
  curve?: "linear" | "easeOutCubic";
  /** Adds subtle per-run random variation to the curve (default: false) */
  randomized?: boolean;
};

export const LoadingBar = ({
  durationSeconds,
  height = 6,
  startedAt,
  startCap = 0,
  endCap = 100,
  curve = "linear",
  randomized = false,
}: LoadingBarProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!durationSeconds || durationSeconds <= 0) {
      setProgress(100);
      return;
    }

    const start =
      typeof startedAt === "number" && Number.isFinite(startedAt)
        ? startedAt
        : Date.now();
    const durationMs = durationSeconds * 1000;
    const normalizedStartCap = Math.min(Math.max(startCap, 0), 100);
    const normalizedEndCap = Math.min(Math.max(endCap, normalizedStartCap), 100);
    const randomPower = randomized ? 2.4 + Math.random() * 1.4 : 3;
    const randomSkew = randomized ? 0.9 + Math.random() * 0.25 : 1;
    const applyCurve = (ratio: number) => {
      if (curve === "easeOutCubic") {
        const eased = 1 - Math.pow(1 - ratio, randomPower);
        return Math.pow(eased, randomSkew);
      }
      return ratio;
    };

    let frameId: number;

    const tick = () => {
      const elapsed = Date.now() - start;
      const ratio = Math.min(Math.max(elapsed / durationMs, 0), 1);
      const curvedRatio = applyCurve(ratio);
      const percentage =
        normalizedStartCap + curvedRatio * (normalizedEndCap - normalizedStartCap);
      setProgress(percentage);

      if (ratio < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    tick();

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [durationSeconds, startedAt, startCap, endCap, curve, randomized]);

  return (
    <div
        style={{ height }}
        className="w-full bg-gray-200 rounded-full overflow-hidden"
    >
      <div
        className="h-full bg-blue-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};
