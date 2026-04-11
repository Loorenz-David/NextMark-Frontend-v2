import { memo } from 'react'

import type { AiAnalyticsMetricGridData } from '@nextmark/ai-panel'

interface AiAnalyticsMetricGridProps {
  data: AiAnalyticsMetricGridData
}

function getMetricValue(metric: AiAnalyticsMetricGridData['metrics'][number]): string {
  if (typeof metric.displayValue === 'string' && metric.displayValue.trim().length > 0) {
    return metric.displayValue
  }

  if (typeof metric.value === 'number') {
    return Number.isInteger(metric.value) ? String(metric.value) : metric.value.toFixed(1)
  }

  if (typeof metric.value === 'string' && metric.value.trim().length > 0) {
    return metric.value
  }

  return '—'
}

function getTrendClassName(trend?: string, emphasis?: string): string {
  if (emphasis === 'critical') return 'text-rose-300'
  if (emphasis === 'warning') return 'text-amber-300'
  if (emphasis === 'positive') return 'text-emerald-300'
  if (trend === 'up') return 'text-emerald-300'
  if (trend === 'down') return 'text-amber-300'
  return 'text-[var(--color-muted)]'
}

function AiAnalyticsMetricGridComponent({ data }: AiAnalyticsMetricGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {data.metrics.map((metric) => (
        <div
          key={metric.id}
          className="admin-glass-panel admin-surface-compact flex min-h-[110px] flex-col gap-2 rounded-lg border border-white/10 p-4"
          title={metric.hint ?? metric.description}
        >
          <div className="text-[0.68rem] uppercase tracking-[0.14em] text-[var(--color-muted)]">
            {metric.label}
          </div>
          <div className="text-2xl font-semibold tracking-tight text-[var(--color-text)]">
            {getMetricValue(metric)}
          </div>
          {metric.changeLabel ? (
            <div className={`text-xs font-medium ${getTrendClassName(metric.trend, metric.emphasis)}`}>
              {metric.changeLabel}
            </div>
          ) : null}
          {metric.description ? (
            <div className="mt-auto text-xs leading-5 text-[var(--color-muted)]/95">
              {metric.description}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )
}

export const AiAnalyticsMetricGrid = memo(AiAnalyticsMetricGridComponent)