import type { ServiceTime } from '@/features/plan/routeGroup/types/serviceTime'

const normalizePart = (value: number | null | undefined): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0
  return Math.max(0, Math.trunc(value))
}

export const serviceTimeMinutesToSeconds = (
  value: ServiceTime | null | undefined,
): ServiceTime | null => {
  if (!value) return null
  return {
    time: normalizePart(value.time) * 60,
    per_item: normalizePart(value.per_item) * 60,
  }
}

export const serviceTimeSecondsToMinutes = (
  value: ServiceTime | null | undefined,
): ServiceTime | null => {
  if (!value) return null
  return {
    time: Math.max(0, Math.trunc(normalizePart(value.time) / 60)),
    per_item: Math.max(0, Math.trunc(normalizePart(value.per_item) / 60)),
  }
}
