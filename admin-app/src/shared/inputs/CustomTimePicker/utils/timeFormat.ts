import type { Period, PickerFormat, TimeValue } from '../types'
import { clampHour12, clampHour24, clampMinute } from './timeClamp'

export const to2 = (value: number) => String(value).padStart(2, '0')

export const parseHHmm = (value?: string | null): TimeValue | null => {
  if (!value || typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  if (!/^\d{1,2}:\d{1,2}$/.test(trimmed)) {
    return null
  }

  const [hourRaw, minuteRaw] = trimmed.split(':')
  const hour = Number(hourRaw)
  const minute = Number(minuteRaw)

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return null
  }

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null
  }

  return { hour, minute }
}

export const formatHHmm = (value: TimeValue): string => {
  return `${to2(clampHour24(value.hour))}:${to2(clampMinute(value.minute))}`
}

export const to12HourParts = (
  value: TimeValue,
): { hour: number; minute: number; period: Period } => {
  const hour24 = clampHour24(value.hour)
  const minute = clampMinute(value.minute)
  const period: Period = hour24 >= 12 ? 'PM' : 'AM'
  const base = hour24 % 12
  const hour = base === 0 ? 12 : base
  return {
    hour,
    minute,
    period,
  }
}

export const to24HourValue = (
  hour12: number,
  minute: number,
  period: Period,
): TimeValue => {
  const clampedHour12 = clampHour12(hour12)
  const base = clampedHour12 % 12
  const hour = period === 'PM' ? base + 12 : base

  return {
    hour,
    minute: clampMinute(minute),
  }
}

export const formatDisplayTime = (value: TimeValue, format: PickerFormat): string => {
  if (format === '24h') {
    return formatHHmm(value)
  }

  const parts = to12HourParts(value)
  return `${to2(parts.hour)}:${to2(parts.minute)} ${parts.period}`
}
