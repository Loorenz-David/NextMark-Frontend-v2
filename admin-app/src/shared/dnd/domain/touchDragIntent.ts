export const TOUCH_DRAG_INTENT_DEFAULTS = {
  holdMs: 220,
  tolerancePx: 8,
  minDwellMs: 120,
  maxStartSpeedPxPerMs: 0.8,
  recentWindowMs: 50,
  pressCueDelayMs: 80,
} as const

export type TouchDragIntentConfig = {
  holdMs: number
  tolerancePx: number
  minDwellMs: number
  maxStartSpeedPxPerMs: number
  recentWindowMs: number
  pressCueDelayMs: number
}

export type TouchSample = { t: number; x: number; y: number }
export type TouchDragPhase = 'pending' | 'active' | 'aborted'
export type TouchDragDecision = {
  effect: 'none' | 'activate' | 'abort' | 'drag-move'
  preventDefault: boolean
}
export type TouchIntentMetrics = {
  elapsedMs: number
  distancePx: number
  recentSpeed: number
}

const distance = (a: TouchSample, b: TouchSample) => Math.hypot(a.x - b.x, a.y - b.y)

export const recentSpeed = (samples: TouchSample[], windowMs: number): number => {
  if (samples.length < 2 || windowMs <= 0) return 0
  const last = samples[samples.length - 1]
  const cutoff = last.t - windowMs
  let first = samples.length - 1
  while (first > 0 && samples[first - 1].t >= cutoff) first -= 1
  if (first === samples.length - 1) return 0
  let travel = 0
  for (let index = first + 1; index < samples.length; index += 1) {
    travel += distance(samples[index - 1], samples[index])
  }
  const duration = last.t - samples[first].t
  return duration > 0 ? travel / duration : 0
}

export const createTouchDragIntent = (config: TouchDragIntentConfig, start: TouchSample) => {
  let currentPhase: TouchDragPhase = 'pending'
  const samples = [start]
  let metrics: TouchIntentMetrics = { elapsedMs: 0, distancePx: 0, recentSpeed: 0 }

  return {
    move(sample: TouchSample, cancelable: boolean): TouchDragDecision {
      if (currentPhase === 'aborted') return { effect: 'none', preventDefault: false }
      if (currentPhase === 'active') return { effect: 'drag-move', preventDefault: cancelable }
      samples.push(sample)
      metrics = {
        elapsedMs: Math.max(0, sample.t - start.t),
        distancePx: distance(start, sample),
        recentSpeed: recentSpeed(samples, config.recentWindowMs),
      }
      if (metrics.distancePx <= config.tolerancePx) return { effect: 'none', preventDefault: false }
      if (
        cancelable &&
        metrics.elapsedMs >= config.minDwellMs &&
        metrics.recentSpeed <= config.maxStartSpeedPxPerMs
      ) {
        currentPhase = 'active'
        return { effect: 'activate', preventDefault: true }
      }
      currentPhase = 'aborted'
      return { effect: 'abort', preventDefault: false }
    },
    holdElapsed(t: number): { effect: 'none' | 'activate' } {
      if (currentPhase !== 'pending' || t - start.t < config.holdMs) return { effect: 'none' }
      currentPhase = 'active'
      metrics = { ...metrics, elapsedMs: t - start.t }
      return { effect: 'activate' }
    },
    abort() { currentPhase = 'aborted' },
    phase: () => currentPhase,
    metrics: () => ({ ...metrics }),
  }
}
