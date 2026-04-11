import { normalizeToCalendarDay } from './normalize.utils'

const clampWeekStartsOn = (value: number): number => {
  if (!Number.isInteger(value)) {
    return 1
  }

  if (value < 0) {
    return 0
  }

  if (value > 6) {
    return 6
  }

  return value
}

export const startOfMonth = (date: Date): Date => {
  const normalized = normalizeToCalendarDay(date)
  return new Date(normalized.getFullYear(), normalized.getMonth(), 1)
}

export const endOfMonth = (date: Date): Date => {
  const normalized = normalizeToCalendarDay(date)
  return new Date(normalized.getFullYear(), normalized.getMonth() + 1, 0)
}

export const addDays = (date: Date, amount: number): Date => {
  const normalized = normalizeToCalendarDay(date)
  return new Date(normalized.getFullYear(), normalized.getMonth(), normalized.getDate() + amount)
}

export const addMonths = (date: Date, amount: number): Date => {
  const normalized = normalizeToCalendarDay(date)

  const currentYear = normalized.getFullYear()
  const currentMonth = normalized.getMonth()
  const currentDay = normalized.getDate()

  const targetStart = new Date(currentYear, currentMonth + amount, 1)
  const targetYear = targetStart.getFullYear()
  const targetMonth = targetStart.getMonth()
  const maxDay = new Date(targetYear, targetMonth + 1, 0).getDate()

  return new Date(targetYear, targetMonth, Math.min(currentDay, maxDay))
}

export const startOfWeek = (date: Date, weekStartsOn = 1): Date => {
  const normalized = normalizeToCalendarDay(date)
  const safeWeekStartsOn = clampWeekStartsOn(weekStartsOn)
  const day = normalized.getDay()
  const offset = (day - safeWeekStartsOn + 7) % 7

  return addDays(normalized, -offset)
}

export const endOfWeek = (date: Date, weekStartsOn = 1): Date => {
  return addDays(startOfWeek(date, weekStartsOn), 6)
}

export const isSameDay = (a: Date, b: Date): boolean => {
  return a.getTime() === b.getTime()
}

export const isSameMonth = (a: Date, b: Date): boolean => {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

export const isBefore = (a: Date, b: Date): boolean => {
  return a.getTime() < b.getTime()
}

export const isAfter = (a: Date, b: Date): boolean => {
  return a.getTime() > b.getTime()
}

export { clampWeekStartsOn }
