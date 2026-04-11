import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

import type { RouteGroupAnimatedMetric } from './routeGroupStatsOverlay.types'

type UseAnimatedMetricValueOptions = {
  metric: RouteGroupAnimatedMetric | null | undefined
  routeScopeKey: string
}

type UseAnimatedMetricValueResult = {
  value: number | null
  changeTick: number
  sourceType: RouteGroupAnimatedMetric['sourceType'] | null
  didChange: boolean
}

const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3)

const hasMeaningfulChange = (previous: number, next: number, metric: RouteGroupAnimatedMetric) => {
  const compareMode = metric.compareMode ?? 'strict'
  if (compareMode === 'epsilon') {
    const epsilon = Math.max(0.0001, metric.epsilon ?? 0.01)
    return Math.abs(previous - next) >= epsilon
  }

  if (compareMode === 'threshold') {
    const threshold = Math.max(0.0001, metric.threshold ?? 1)
    return Math.abs(previous - next) >= threshold
  }

  return previous !== next
}

const resolveDurationMs = (from: number, to: number) => {
  const distance = Math.abs(to - from)
  const duration = 320 + Math.log10(distance + 1) * 220
  return Math.max(320, Math.min(750, duration))
}

export const formatAnimatedMetricValue = (
  metric: RouteGroupAnimatedMetric,
  numericValue: number,
): string => {
  if (!Number.isFinite(numericValue)) {
    return '0'
  }

  if (metric.valueType === 'duration_seconds') {
    const totalMinutes = Math.max(0, Math.round(numericValue / 60))
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return `${hours}h ${minutes}m`
  }

  if (metric.valueType === 'integer') {
    const rounded = Math.round(numericValue)
    return metric.unitSuffix ? `${rounded} ${metric.unitSuffix}` : `${rounded}`
  }

  if (metric.valueType === 'percent') {
    return `${Math.round(numericValue)}%`
  }

  if (metric.valueType === 'currency') {
    const decimals = typeof metric.decimals === 'number' ? metric.decimals : 1
    const fixed = numericValue.toFixed(decimals)
    const suffix = metric.unitSuffix ?? '€'
    return `${fixed} ${suffix}`
  }

  const decimals = typeof metric.decimals === 'number' ? metric.decimals : 1
  const fixed = numericValue.toFixed(decimals)
  return metric.unitSuffix ? `${fixed} ${metric.unitSuffix}` : fixed
}

export const useAnimatedMetricValue = ({
  metric,
  routeScopeKey,
}: UseAnimatedMetricValueOptions): UseAnimatedMetricValueResult => {
  const prefersReducedMotion = useReducedMotion()
  const [displayValue, setDisplayValue] = useState<number | null>(metric?.numericValue ?? null)
  const [changeTick, setChangeTick] = useState(0)

  const routeScopeRef = useRef(routeScopeKey)
  const hasHydratedRef = useRef(false)
  const rafRef = useRef<number | null>(null)
  const displayedValueRef = useRef<number | null>(metric?.numericValue ?? null)
  const previousTargetRef = useRef<number | null>(metric?.numericValue ?? null)
  const didChangeRef = useRef(false)

  useEffect(() => {
    displayedValueRef.current = displayValue
  }, [displayValue])

  useEffect(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }

    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const nextValue = metric?.numericValue ?? null

    if (routeScopeRef.current !== routeScopeKey) {
      routeScopeRef.current = routeScopeKey
      hasHydratedRef.current = false
      previousTargetRef.current = nextValue
      displayedValueRef.current = nextValue
      setDisplayValue(nextValue)
      didChangeRef.current = false
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }

    if (nextValue == null || metric == null || !Number.isFinite(nextValue)) {
      previousTargetRef.current = null
      displayedValueRef.current = null
      setDisplayValue(null)
      didChangeRef.current = false
      return
    }

    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true
      previousTargetRef.current = nextValue
      displayedValueRef.current = nextValue
      setDisplayValue(nextValue)
      didChangeRef.current = false
      return
    }

    const previousValue = previousTargetRef.current
    if (previousValue == null) {
      previousTargetRef.current = nextValue
      displayedValueRef.current = nextValue
      setDisplayValue(nextValue)
      didChangeRef.current = false
      return
    }

    const changed = hasMeaningfulChange(previousValue, nextValue, metric)
    didChangeRef.current = changed

    if (!changed) {
      previousTargetRef.current = nextValue
      displayedValueRef.current = nextValue
      setDisplayValue(nextValue)
      return
    }

    setChangeTick((value) => value + 1)

    if (prefersReducedMotion) {
      previousTargetRef.current = nextValue
      displayedValueRef.current = nextValue
      setDisplayValue(nextValue)
      return
    }

    const fromValue = displayedValueRef.current ?? previousValue
    const durationMs = resolveDurationMs(fromValue, nextValue)
    const animationStart = performance.now()

    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }

    const tick = (time: number) => {
      const elapsed = time - animationStart
      const progress = Math.min(1, elapsed / durationMs)
      const easedProgress = easeOutCubic(progress)
      const frameValue = fromValue + (nextValue - fromValue) * easedProgress
      displayedValueRef.current = frameValue
      setDisplayValue(frameValue)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      previousTargetRef.current = nextValue
      displayedValueRef.current = nextValue
      setDisplayValue(nextValue)
      rafRef.current = null
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [metric, prefersReducedMotion, routeScopeKey])

  return {
    value: displayValue,
    changeTick,
    sourceType: metric?.sourceType ?? null,
    didChange: didChangeRef.current,
  }
}
