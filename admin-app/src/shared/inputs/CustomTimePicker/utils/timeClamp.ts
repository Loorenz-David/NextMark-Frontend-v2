import type { TimeValue } from '../types'

export const clampHour24 = (value: number) => Math.min(23, Math.max(0, Math.trunc(value)))
export const clampHour12 = (value: number) => Math.min(12, Math.max(1, Math.trunc(value)))
export const clampMinute = (value: number) => Math.min(59, Math.max(0, Math.trunc(value)))

const clampMinuteStep = (minuteStep: number) => {
  if (!Number.isFinite(minuteStep)) return 1
  return Math.min(30, Math.max(1, Math.trunc(minuteStep)))
}

export const normalizeMinuteByStep = (minute: number, minuteStep: number) => {
  const safeStep = clampMinuteStep(minuteStep)
  const clamped = clampMinute(minute)
  if (safeStep === 1) {
    return clamped
  }

  const rounded = Math.round(clamped / safeStep) * safeStep
  return Math.min(59, Math.max(0, rounded))
}

export const normalizeTimeValue = (
  value: TimeValue,
  minuteStep: number,
): TimeValue => ({
  hour: clampHour24(value.hour),
  minute: normalizeMinuteByStep(value.minute, minuteStep),
})

export const minuteValuesByStep = (minuteStep: number): number[] => {
  const safeStep = clampMinuteStep(minuteStep)
  const values: number[] = []
  for (let minute = 0; minute < 60; minute += safeStep) {
    values.push(minute)
  }
  if (values[values.length - 1] !== 59) {
    values.push(59)
  }
  return values
}
