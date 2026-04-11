import { normalizeToCalendarDay } from './normalize.utils'

const pad = (value: number) => value.toString().padStart(2, '0')

export const getCalendarDayKey = (date: Date): string => {
  const normalized = normalizeToCalendarDay(date)
  const year = normalized.getFullYear()
  const month = pad(normalized.getMonth() + 1)
  const day = pad(normalized.getDate())

  return `${year}-${month}-${day}`
}
