import { memo, useMemo } from 'react'
import { Area, AreaChart, Bar, BarChart, Cell, LabelList, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import type { AiAnalyticsBarListData, AiMessageBlockMeta } from '@nextmark/ai-panel'

interface AiAnalyticsBarListProps {
  data: AiAnalyticsBarListData
  meta?: AiMessageBlockMeta
}

type ChartVariant = 'bar' | 'line' | 'area' | 'donut'

type AnalyticsBarDatum = {
  id: string
  label: string
  value: number
  displayValue?: string
  hint?: string
  color?: string
  fill?: string
}

const DEFAULT_CHART_COLORS = ['#84D3FF', '#71CDE9', '#5F93D9', '#90CAF9', '#4FC3F7']

const COMPACT_NUMBER_FORMATTER = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

function isChartVariant(value: unknown): value is ChartVariant {
  return value === 'bar' || value === 'line' || value === 'area' || value === 'donut'
}

function resolveChartVariant(meta?: AiMessageBlockMeta): ChartVariant {
  const explicitVariant = meta?.chartType ?? meta?.chart_type
  if (isChartVariant(explicitVariant)) {
    return explicitVariant
  }

  if (meta?.sourceKind === 'analytics_trend') {
    return 'line'
  }

  return 'bar'
}

function formatValue(value: number, displayValue?: string): string {
  if (typeof displayValue === 'string' && displayValue.trim().length > 0) {
    return displayValue
  }

  if (!Number.isFinite(value)) {
    return '—'
  }

  if (Math.abs(value) >= 1000) {
    return COMPACT_NUMBER_FORMATTER.format(value)
  }

  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

function formatNumericLabel(value: unknown): string {
  const numericValue = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(numericValue)) {
    return ''
  }

  return formatValue(numericValue)
}

function AnalyticsTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: AnalyticsBarDatum }>
}) {
  if (!active || !payload?.length) {
    return null
  }

  const datum = payload[0].payload
  return (
    <div className="rounded-md border border-white/10 bg-[#0f172a]/95 px-2 py-1.5 text-xs text-white shadow-xl">
      <div className="font-medium">{datum.label}</div>
      <div className="text-white/80">{formatValue(datum.value, datum.displayValue)}</div>
      {datum.hint ? <div className="mt-1 text-white/60">{datum.hint}</div> : null}
    </div>
  )
}

function AiAnalyticsBarListComponent({ data, meta }: AiAnalyticsBarListProps) {
  const chartVariant = resolveChartVariant(meta)

  const chartData = useMemo<AnalyticsBarDatum[]>(() => {
    return data.items.map((item, index) => ({
      id: item.id,
      label: item.label,
      value: item.value,
      displayValue: item.displayValue,
      hint: item.hint,
      color: item.color,
      fill: item.color ?? DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length],
    }))
  }, [data.items])

  const chartHeight = Math.max(240, chartData.length * 48)
  const donutTotal = useMemo(
    () => chartData.reduce((sum, item) => sum + item.value, 0),
    [chartData],
  )

  return (
    <div className="admin-glass-panel admin-surface-compact flex flex-col gap-3 rounded-lg border border-white/10 p-4">
      <svg className="h-0 w-0" aria-hidden>
        <defs>
          <linearGradient id="aiBarGradient" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="var(--color-light-blue)" />
            <stop offset="100%" stopColor="rgba(132,211,255,0.4)" />
          </linearGradient>
          <linearGradient id="aiAreaGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--color-light-blue)" stopOpacity={0.7} />
            <stop offset="100%" stopColor="var(--color-light-blue)" stopOpacity={0.08} />
          </linearGradient>
        </defs>
      </svg>

      <div style={{ height: chartHeight }}>
        {chartVariant === 'bar' ? (
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
              <XAxis hide type="number" />
              <YAxis
                axisLine={false}
                dataKey="label"
                tick={{ fill: 'var(--color-muted)', fontSize: 12 }}
                tickLine={false}
                type="category"
                width={132}
              />
              <Tooltip content={<AnalyticsTooltip />} cursor={{ fill: 'rgba(255,255,255,0.06)' }} />
              <Bar animationDuration={650} dataKey="value" isAnimationActive radius={[0, 6, 6, 0]}>
                {chartData.map((item) => (
                  <Cell
                    fill={item.color ?? 'url(#aiBarGradient)'}
                    key={item.id}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : null}

        {chartVariant === 'line' ? (
          <ResponsiveContainer height="100%" width="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 14, bottom: 8, left: 0 }}>
              <XAxis axisLine={false} dataKey="label" tick={{ fill: 'var(--color-muted)', fontSize: 12 }} tickLine={false} />
              <YAxis axisLine={false} tick={{ fill: 'var(--color-muted)', fontSize: 12 }} tickLine={false} width={42} />
              <Tooltip content={<AnalyticsTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.15)', strokeWidth: 1 }} />
              <Line
                animationDuration={650}
                dataKey="value"
                dot={{ fill: 'var(--color-light-blue)', r: 3, strokeWidth: 0 }}
                isAnimationActive
                label={{
                  fill: 'var(--color-muted)',
                  fontSize: 10,
                  formatter: formatNumericLabel,
                  offset: 10,
                }}
                stroke="var(--color-light-blue)"
                strokeWidth={2}
                type="monotone"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : null}

        {chartVariant === 'area' ? (
          <ResponsiveContainer height="100%" width="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 14, bottom: 8, left: 0 }}>
              <XAxis axisLine={false} dataKey="label" tick={{ fill: 'var(--color-muted)', fontSize: 12 }} tickLine={false} />
              <YAxis axisLine={false} tick={{ fill: 'var(--color-muted)', fontSize: 12 }} tickLine={false} width={42} />
              <Tooltip content={<AnalyticsTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.15)', strokeWidth: 1 }} />
              <Area
                animationDuration={650}
                dataKey="value"
                fill="url(#aiAreaGradient)"
                isAnimationActive
                stroke="var(--color-light-blue)"
                strokeWidth={2}
                type="monotone"
              >
                <LabelList
                  className="pointer-events-none"
                  dataKey="value"
                  fill="var(--color-muted)"
                  fontSize={10}
                  formatter={formatNumericLabel}
                  position="top"
                />
              </Area>
            </AreaChart>
          </ResponsiveContainer>
        ) : null}

        {chartVariant === 'donut' ? (
          <div className="relative h-full w-full">
            <ResponsiveContainer height="100%" width="100%">
              <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                <Tooltip content={<AnalyticsTooltip />} />
                <Pie
                  animationDuration={650}
                  cx="50%"
                  cy="50%"
                  data={chartData}
                  dataKey="value"
                  innerRadius="54%"
                  isAnimationActive
                  outerRadius="82%"
                  paddingAngle={2}
                >
                  {chartData.map((item) => (
                    <Cell key={item.id} fill={item.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-[0.62rem] uppercase tracking-[0.12em] text-[var(--color-muted)]">Total</div>
                <div className="text-sm font-semibold text-[var(--color-text)]">{formatValue(donutTotal)}</div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid gap-1.5">
        {chartData.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-2 text-xs text-[var(--color-muted)]/95">
            <span className="truncate" title={item.hint}>{item.label}</span>
            <span className="shrink-0 font-medium text-[var(--color-text)]/90">{formatValue(item.value, item.displayValue)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export const AiAnalyticsBarList = memo(AiAnalyticsBarListComponent)