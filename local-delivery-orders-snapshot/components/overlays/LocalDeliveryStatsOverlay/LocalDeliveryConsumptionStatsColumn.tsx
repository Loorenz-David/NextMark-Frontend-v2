import { motion, useReducedMotion } from 'framer-motion'

import type { LocalDeliveryConsumptionMetric } from './LocalDeliveryStatsOverlay.types'
import { formatAnimatedMetricValue, useAnimatedMetricValue } from './useAnimatedMetricValue'

type LocalDeliveryConsumptionStatsColumnProps = {
  metrics: LocalDeliveryConsumptionMetric[]
  routeScopeKey: string
}

const ConsumptionMetricCard = ({
  metric,
  routeScopeKey,
}: {
  metric: LocalDeliveryConsumptionMetric
  routeScopeKey: string
}) => {
  const prefersReducedMotion = useReducedMotion()
  const { value, changeTick, sourceType } = useAnimatedMetricValue({
    metric: metric.animation,
    routeScopeKey,
  })

  const isEstimated = sourceType === 'estimated'
  const resolvedValue = value != null
    ? formatAnimatedMetricValue(metric.animation, value)
    : metric.displayValue

  return (
    <div
      key={metric.id}
      className={`flex min-h-[78px] flex-col justify-between rounded-2xl border bg-black/28 px-4 py-3 text-sm text-white backdrop-blur-md ${
        isEstimated ? 'border-white/30' : 'border-white/45'
      }`}
    >
      <motion.div
        key={`${metric.id}-${changeTick}`}
        initial={prefersReducedMotion ? undefined : { scale: 1.06 }}
        animate={prefersReducedMotion ? undefined : { scale: 1 }}
        transition={prefersReducedMotion ? undefined : { duration: 0.2, ease: 'easeOut' }}
        className={`text-sm font-semibold ${isEstimated ? 'text-white/82' : 'text-white'}`}
      >
        {resolvedValue}
      </motion.div>
      <div className="flex items-center gap-2">
        <div className="text-xs font-medium text-white/76">{metric.label}</div>
        {isEstimated ? (
          <span className="rounded-full border border-white/25 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.08em] text-white/62">
            Est.
          </span>
        ) : null}
      </div>
    </div>
  )
}

export const LocalDeliveryConsumptionStatsColumn = ({
  metrics,
  routeScopeKey,
}: LocalDeliveryConsumptionStatsColumnProps) => (
  <div className="flex min-w-[160px] flex-col gap-3">
    {metrics.map((metric) => (
      <ConsumptionMetricCard
        key={metric.id}
        metric={metric}
        routeScopeKey={routeScopeKey}
      />
    ))}
  </div>
)
