type DateOnlyParts = {
  year: number
  month: number
  day: number
}

const getDateOnlyParts = (value?: string | null): DateOnlyParts | null => {
  const dateOnly = value?.trim().split(/[T\s]/)[0]
  const match = dateOnly?.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null
  }

  return { year, month, day }
}

const formatRoutePlanDateValue = (value?: string | null): string => {
  const parts = getDateOnlyParts(value)
  if (!parts) return '--'

  return [
    String(parts.day).padStart(2, '0'),
    String(parts.month).padStart(2, '0'),
    String(parts.year).padStart(4, '0'),
  ].join('-')
}

export const formatRoutePlanDate = (
  startIso?: string | null,
  endIso?: string | null,
): string => {
  const start = formatRoutePlanDateValue(startIso)
  const end = formatRoutePlanDateValue(endIso)

  if (start === '--') return end
  const startDateOnly = startIso?.trim().split(/[T\s]/)[0]
  const endDateOnly = endIso?.trim().split(/[T\s]/)[0]
  if (end === '--' || startDateOnly === endDateOnly) {
    return start
  }

  return `${start}  --  ${end}`
}

export const getRoutePlanIsoWeekNumber = (
  value?: string | null,
): number | null => {
  const parts = getDateOnlyParts(value)
  if (!parts) return null

  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day))
  const isoDay = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - isoDay)

  const isoYearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.ceil(
    ((date.getTime() - isoYearStart.getTime()) / 86_400_000 + 1) / 7,
  )
}
