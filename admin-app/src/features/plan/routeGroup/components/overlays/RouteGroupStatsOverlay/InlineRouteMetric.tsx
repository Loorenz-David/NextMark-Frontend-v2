import { motion, useReducedMotion } from "framer-motion";

import type { RouteGroupSummaryMetric } from "./routeGroupStatsOverlay.types";
import {
  formatAnimatedMetricValue,
  useAnimatedMetricValue,
} from "./useAnimatedMetricValue";

type InlineRouteMetricProps = {
  metric: RouteGroupSummaryMetric;
  routeScopeKey: string;
};

export const InlineRouteMetric = ({
  metric,
  routeScopeKey,
}: InlineRouteMetricProps) => {
  const prefersReducedMotion = useReducedMotion();
  const { value, changeTick, sourceType } = useAnimatedMetricValue({
    metric: metric.animation,
    routeScopeKey,
  });

  const resolvedValue =
    metric.animation && value != null
      ? formatAnimatedMetricValue(metric.animation, value)
      : metric.value === ""
        ? ""
        : metric.value || "—";
  const isEstimated = sourceType === "estimated";

  return (
    <div className="flex min-h-[52px] min-w-0 flex-col justify-between rounded-2xl bg-white/6 px-3 py-2 text-white">
      <div className="flex min-w-0 items-baseline gap-2">
        <motion.span
          key={`${metric.id}-${changeTick}`}
          initial={prefersReducedMotion ? undefined : { scale: 1.06 }}
          animate={prefersReducedMotion ? undefined : { scale: 1 }}
          transition={
            prefersReducedMotion
              ? undefined
              : { duration: 0.2, ease: "easeOut" }
          }
          className={`min-w-0 truncate text-sm font-semibold ${isEstimated ? "text-white/82" : "text-white"}`}
        >
          {resolvedValue}
        </motion.span>
        {metric.delta ? (
          <span className="shrink-0 text-[10px] font-medium text-white/72">
            {metric.delta}
          </span>
        ) : null}
      </div>
      <span className="truncate text-[11px] font-medium uppercase tracking-[0.08em] text-white/68">
        {metric.label || " "}
        {isEstimated ? " est." : ""}
      </span>
    </div>
  );
};
