import { addDays, clampWeekStartsOn, startOfMonth, startOfWeek } from './date.utils'

export type CalendarDay = {
  date: Date
  isCurrentMonth: boolean
}

export type BuildMonthMatrixParams = {
  year: number
  month: number
  weekStartsOn?: number
}

export const buildMonthMatrix = ({
  year,
  month,
  weekStartsOn = 1,
}: BuildMonthMatrixParams): CalendarDay[][] => {
  const currentMonthDate = new Date(year, month, 1)
  const monthStart = startOfMonth(currentMonthDate)
  const matrixStart = startOfWeek(monthStart, clampWeekStartsOn(weekStartsOn))

  const rows: CalendarDay[][] = []

  for (let week = 0; week < 6; week += 1) {
    const weekRow: CalendarDay[] = []

    for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
      const offset = week * 7 + dayOffset
      const date = addDays(matrixStart, offset)

      weekRow.push({
        date,
        isCurrentMonth: date.getFullYear() === year && date.getMonth() === month,
      })
    }

    rows.push(weekRow)
  }

  return rows
}
