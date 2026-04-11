import { memo } from 'react'

type AiAnalyticsKpiData = {
  metric_name?: string
  value?: number | string
  display_value?: string
  delta?: number | string
  unit?: string
  description?: string
  confidence_score?: number
}

interface AiAnalyticsKpiProps {
  title?: string
  subtitle?: string
  data: AiAnalyticsKpiData
}

function formatValue(value: number | string | undefined, displayValue?: string) {
  if (typeof displayValue === 'string' && displayValue.trim().length > 0) {
    return displayValue
  }

  if (typeof value === 'number') {
    return Number.isInteger(value) ? String(value) : value.toFixed(1)
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    return value
  }

  return '—'
}

function formatDelta(delta: number | string | undefined, unit?: string) {
  if (typeof delta === 'number') {
    const prefix = delta > 0 ? '+' : ''
    return `${prefix}${delta}${unit ?? ''}`
  }

  if (typeof delta === 'string' && delta.trim().length > 0) {
    return delta
  }

  return null
}

function AiAnalyticsKpiComponent({ title, subtitle, data }: AiAnalyticsKpiProps) {
  const deltaLabel = formatDelta(data.delta, data.unit)
  const confidenceLabel = typeof data.confidence_score === 'number'
    ? `Confidence ${(data.confidence_score * 100).toFixed(0)}%`
    : null

  return (
    <div className="admin-glass-panel admin-surface-compact flex min-h-[140px] flex-col gap-3 rounded-lg border border-white/10 p-4">
      <div className="flex flex-col gap-1">
        <div className="text-[0.68rem] uppercase tracking-[0.14em] text-[var(--color-muted)]">
          {title ?? data.metric_name ?? 'Metric'}
        </div>
        {subtitle ? (
          <div className="text-xs text-[var(--color-muted)]/90">{subtitle}</div>
        ) : null}
      </div>
      <div className="text-3xl font-semibold tracking-tight text-[var(--color-text)]">
        {formatValue(data.value, data.display_value)}
      </div>
      {deltaLabel ? (
        <div className="text-sm font-medium text-emerald-300">
          {deltaLabel}
        </div>
      ) : null}
      {data.description ? (
        <div className="mt-auto text-xs leading-5 text-[var(--color-muted)]/95">
          {data.description}
        </div>
      ) : null}
      {confidenceLabel ? (
        <div className="text-[0.68rem] uppercase tracking-[0.14em] text-[var(--color-muted)]/80">
          {confidenceLabel}
        </div>
      ) : null}
    </div>
  )
}

export const AiAnalyticsKpi = memo(AiAnalyticsKpiComponent)