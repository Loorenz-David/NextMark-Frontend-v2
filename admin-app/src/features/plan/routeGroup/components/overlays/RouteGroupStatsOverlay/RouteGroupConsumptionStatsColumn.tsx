import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { InfoIcon } from "@/assets/icons";
import { FloatingPopover } from "@/shared/popups/FloatingPopover/FloatingPopover";

import type { RouteGroupConsumptionMetric } from "./routeGroupStatsOverlay.types";
import {
  formatAnimatedMetricValue,
  useAnimatedMetricValue,
} from "./useAnimatedMetricValue";

type RouteGroupConsumptionStatsColumnProps = {
  metrics: RouteGroupConsumptionMetric[];
  routeScopeKey: string;
};

const ConsumptionMetricCard = ({
  metric,
  routeScopeKey,
}: {
  metric: RouteGroupConsumptionMetric;
  routeScopeKey: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { value, changeTick, sourceType } = useAnimatedMetricValue({
    metric: metric.animation,
    routeScopeKey,
  });

  const isEstimated = sourceType === "estimated";
  const resolvedValue =
    value != null
      ? formatAnimatedMetricValue(metric.animation, value)
      : metric.displayValue;

  const isInteractive = metric.popover != null;

  const cardContent = (
    <div
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={isInteractive ? () => setIsOpen((v) => !v) : undefined}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsOpen((v) => !v);
              }
            }
          : undefined
      }
      className={`admin-backdrop-blur-md relative flex min-h-[78px] min-w-0 flex-col justify-between rounded-2xl border bg-black/28 px-4 py-3 text-sm text-white transition-colors ${
        isInteractive ? "cursor-pointer hover:bg-black/34" : ""
      } ${isEstimated ? "border-white/30" : "border-white/45"}`}
    >
      {isInteractive ? (
        <InfoIcon className="absolute right-3 top-3 h-3 w-3 text-white/45" />
      ) : null}
      <motion.div
        key={`${metric.id}-${changeTick}`}
        initial={prefersReducedMotion ? undefined : { scale: 1.06 }}
        animate={prefersReducedMotion ? undefined : { scale: 1 }}
        transition={
          prefersReducedMotion ? undefined : { duration: 0.2, ease: "easeOut" }
        }
        className={`text-sm font-semibold ${isEstimated ? "text-white/82" : "text-white"}`}
      >
        {resolvedValue}
      </motion.div>
      <div className="flex items-center gap-2">
        <div className="min-w-0 truncate text-xs font-medium text-white/76">{metric.label}</div>
        {isEstimated ? (
          <span className="rounded-full border border-white/25 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.08em] text-white/62">
            Est.
          </span>
        ) : null}
      </div>
    </div>
  );

  if (!isInteractive || !metric.popover) return cardContent;

  return (
    <FloatingPopover
      open={isOpen}
      onOpenChange={setIsOpen}
      placement="top"
      renderInPortal
      offSetNum={10}
      reference={cardContent}
    >
      <div className="admin-backdrop-blur-md min-w-[180px] rounded-2xl border border-white/30 bg-black/60 px-4 py-3 text-sm text-white shadow-xl">
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-white/60">
          {metric.popover.title}
        </div>
        <div className="flex flex-col gap-1">
          {metric.popover.rows.map((row) => (
            <div
              key={row.label}
              className={`flex items-center justify-between gap-6 ${
                row.isResult
                  ? "mt-1 border-t border-white/15 pt-2 font-semibold text-white"
                  : "text-white/72"
              }`}
            >
              <span className="text-xs">{row.label}</span>
              <span className="text-xs">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </FloatingPopover>
  );
};

export const RouteGroupConsumptionStatsColumn = ({
  metrics,
  routeScopeKey,
}: RouteGroupConsumptionStatsColumnProps) => (
  <div className="flex min-w-0 gap-3">
    {metrics.map((metric) => (
      <ConsumptionMetricCard
        key={metric.id}
        metric={metric}
        routeScopeKey={routeScopeKey}
      />
    ))}
  </div>
);
