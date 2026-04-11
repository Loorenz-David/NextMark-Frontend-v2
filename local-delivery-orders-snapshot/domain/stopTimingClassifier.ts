import type { Order } from '@/features/order/types/order'
import type { RouteSolutionStop } from '@/features/local-delivery-orders/types/routeSolutionStop'

export type StopTimingClassification =
  | 'on_time'
  | 'early'
  | 'late'
  | 'unclassified'

export type StopTimingResult = {
  classification: StopTimingClassification
  arrival_delay_seconds: number | null
  arrival_early_seconds: number | null
}

type TimeWindow = {
  start: Date
  end: Date
}

const parseUtcDate = (value?: string | null): Date | null => {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const normalizeWindows = (order?: Order | null): TimeWindow[] => {
  const windows = (order?.delivery_windows ?? [])
    .map((window) => {
      const start = parseUtcDate(window.start_at)
      const end = parseUtcDate(window.end_at)
      if (!start || !end || end <= start) return null
      return { start, end }
    })
    .filter((window): window is TimeWindow => !!window)
    .sort((a, b) => a.start.getTime() - b.start.getTime())

  return windows
}

const buildDelayMetrics = (
  actualArrival: Date | null,
  expectedArrival: Date | null,
) => {
  if (!actualArrival || !expectedArrival) {
    return {
      arrival_delay_seconds: null,
      arrival_early_seconds: null,
    }
  }

  const deltaSeconds = Math.round((actualArrival.getTime() - expectedArrival.getTime()) / 1000)
  return {
    arrival_delay_seconds: Math.max(0, deltaSeconds),
    arrival_early_seconds: Math.max(0, -deltaSeconds),
  }
}

export const classifyStopTiming = (
  stop: RouteSolutionStop,
  order: Order | null | undefined,
  etaToleranceSeconds: number,
): StopTimingResult => {
  const actualArrival = parseUtcDate(stop.actual_arrival_time)
  const expectedArrival = parseUtcDate(stop.expected_arrival_time)
  const delayMetrics = buildDelayMetrics(actualArrival, expectedArrival)

  if (!actualArrival || !order) {
    return {
      classification: 'unclassified',
      ...delayMetrics,
    }
  }

  const windows = normalizeWindows(order)
  if (windows.length > 0) {
    const isInsideWindow = windows.some(
      (window) => actualArrival >= window.start && actualArrival <= window.end,
    )
    if (isInsideWindow) {
      return {
        classification: 'on_time',
        ...delayMetrics,
      }
    }

    if (actualArrival < windows[0]!.start) {
      return {
        classification: 'early',
        ...delayMetrics,
      }
    }

    return {
      classification: 'late',
      ...delayMetrics,
    }
  }

  if (!expectedArrival) {
    return {
      classification: 'unclassified',
      ...delayMetrics,
    }
  }

  const toleranceMs = Math.max(0, etaToleranceSeconds) * 1000
  const windowStart = new Date(expectedArrival.getTime() - toleranceMs)
  const windowEnd = new Date(expectedArrival.getTime() + toleranceMs)

  if (actualArrival < windowStart) {
    return {
      classification: 'early',
      ...delayMetrics,
    }
  }

  if (actualArrival > windowEnd) {
    return {
      classification: 'late',
      ...delayMetrics,
    }
  }

  return {
    classification: 'on_time',
    ...delayMetrics,
  }
}
