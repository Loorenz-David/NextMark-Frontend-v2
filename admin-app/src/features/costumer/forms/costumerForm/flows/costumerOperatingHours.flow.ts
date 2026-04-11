import { buildClientId } from '@/lib/utils/clientId'

import type { CostumerOperatingHours } from '../../../dto/costumer.dto'

export const DEFAULT_OPERATING_OPEN_TIME = '09:00'
export const DEFAULT_OPERATING_CLOSE_TIME = '17:00'

export const WEEKDAY_OPTIONS = [
  { weekday: 0, shortLabel: 'Mon', longLabel: 'Monday' },
  { weekday: 1, shortLabel: 'Tue', longLabel: 'Tuesday' },
  { weekday: 2, shortLabel: 'Wed', longLabel: 'Wednesday' },
  { weekday: 3, shortLabel: 'Thu', longLabel: 'Thursday' },
  { weekday: 4, shortLabel: 'Fri', longLabel: 'Friday' },
  { weekday: 5, shortLabel: 'Sat', longLabel: 'Saturday' },
  { weekday: 6, shortLabel: 'Sun', longLabel: 'Sunday' },
] as const

export const isValidWeekday = (weekday: number) => Number.isInteger(weekday) && weekday >= 0 && weekday <= 6

export const isValidHHmm = (value: string | null | undefined) => {
  if (!value) return false
  if (!/^\d{2}:\d{2}$/.test(value)) return false

  const [hourText, minuteText] = value.split(':')
  const hours = Number(hourText)
  const minutes = Number(minuteText)
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return false
  if (hours < 0 || hours > 23) return false
  if (minutes < 0 || minutes > 59) return false
  return true
}

const toMinutes = (value: string) => {
  const [hourText, minuteText] = value.split(':')
  return Number(hourText) * 60 + Number(minuteText)
}

const normalizeOpenTime = (value: string | null | undefined) =>
  isValidHHmm(value) ? value : DEFAULT_OPERATING_OPEN_TIME

const normalizeCloseTime = (value: string | null | undefined) =>
  isValidHHmm(value) ? value : DEFAULT_OPERATING_CLOSE_TIME

export const sortOperatingHours = (entries: CostumerOperatingHours[]) =>
  [...entries].sort((left, right) => left.weekday - right.weekday)

export const buildDefaultOperatingHoursEntry = (weekday: number): CostumerOperatingHours => ({
  client_id: buildClientId('costumer_operating_hours'),
  weekday,
  is_closed: false,
  open_time: DEFAULT_OPERATING_OPEN_TIME,
  close_time: DEFAULT_OPERATING_CLOSE_TIME,
})

export const normalizeOperatingHoursForForm = (
  entries: CostumerOperatingHours[] | null | undefined,
): CostumerOperatingHours[] => {
  const source = Array.isArray(entries) ? entries : []
  const byWeekday = new Map<number, CostumerOperatingHours>()

  source.forEach((entry) => {
    if (!isValidWeekday(entry.weekday)) {
      return
    }
    if (byWeekday.has(entry.weekday)) {
      return
    }

    const isClosed = Boolean(entry.is_closed)
    byWeekday.set(entry.weekday, {
      id: entry.id,
      client_id: entry.client_id || buildClientId('costumer_operating_hours'),
      weekday: entry.weekday,
      is_closed: isClosed,
      open_time: isClosed ? null : normalizeOpenTime(entry.open_time),
      close_time: isClosed ? null : normalizeCloseTime(entry.close_time),
    })
  })

  return sortOperatingHours(Array.from(byWeekday.values()))
}

export const upsertOperatingHoursEntry = ({
  entries,
  entry,
}: {
  entries: CostumerOperatingHours[]
  entry: CostumerOperatingHours
}) => {
  const filtered = entries.filter((candidate) => candidate.weekday !== entry.weekday)
  return sortOperatingHours([...filtered, entry])
}

export const toggleOperatingHoursDay = ({
  entries,
  weekday,
}: {
  entries: CostumerOperatingHours[]
  weekday: number
}) => {
  if (!isValidWeekday(weekday)) {
    return entries
  }

  const existing = entries.find((entry) => entry.weekday === weekday)
  if (existing) {
    return entries.filter((entry) => entry.weekday !== weekday)
  }

  return upsertOperatingHoursEntry({
    entries,
    entry: buildDefaultOperatingHoursEntry(weekday),
  })
}

export const removeOperatingHoursDay = ({
  entries,
  weekday,
}: {
  entries: CostumerOperatingHours[]
  weekday: number
}) => entries.filter((entry) => entry.weekday !== weekday)

export const setOperatingHoursClosedState = ({
  entries,
  weekday,
  isClosed,
}: {
  entries: CostumerOperatingHours[]
  weekday: number
  isClosed: boolean
}) => {
  const existing = entries.find((entry) => entry.weekday === weekday) ?? buildDefaultOperatingHoursEntry(weekday)
  return upsertOperatingHoursEntry({
    entries,
    entry: {
      ...existing,
      is_closed: isClosed,
      open_time: isClosed ? null : normalizeOpenTime(existing.open_time),
      close_time: isClosed ? null : normalizeCloseTime(existing.close_time),
    },
  })
}

export const setOperatingHoursOpenTimeValue = ({
  entries,
  weekday,
  value,
}: {
  entries: CostumerOperatingHours[]
  weekday: number
  value: string | null
}) => {
  const existing = entries.find((entry) => entry.weekday === weekday) ?? buildDefaultOperatingHoursEntry(weekday)
  return upsertOperatingHoursEntry({
    entries,
    entry: {
      ...existing,
      is_closed: false,
      open_time: value,
      close_time: normalizeCloseTime(existing.close_time),
    },
  })
}

export const setOperatingHoursCloseTimeValue = ({
  entries,
  weekday,
  value,
}: {
  entries: CostumerOperatingHours[]
  weekday: number
  value: string | null
}) => {
  const existing = entries.find((entry) => entry.weekday === weekday) ?? buildDefaultOperatingHoursEntry(weekday)
  return upsertOperatingHoursEntry({
    entries,
    entry: {
      ...existing,
      is_closed: false,
      open_time: normalizeOpenTime(existing.open_time),
      close_time: value,
    },
  })
}

export const toOperatingHoursComparableKey = (entries: CostumerOperatingHours[]) =>
  JSON.stringify(
    sortOperatingHours(entries)
      .filter((entry) => isValidWeekday(entry.weekday))
      .map((entry) => ({
        weekday: entry.weekday,
        is_closed: Boolean(entry.is_closed),
        open_time: Boolean(entry.is_closed) ? null : entry.open_time ?? null,
        close_time: Boolean(entry.is_closed) ? null : entry.close_time ?? null,
      })),
  )

export const hasOperatingHoursChanged = ({
  current,
  initial,
}: {
  current: CostumerOperatingHours[]
  initial: CostumerOperatingHours[]
}) => toOperatingHoursComparableKey(current) !== toOperatingHoursComparableKey(initial)

export const validateOperatingHours = (entries: CostumerOperatingHours[]) => {
  const weekdays = new Set<number>()
  for (const entry of entries) {
    if (!isValidWeekday(entry.weekday)) {
      return { valid: false, message: 'Operating day must be between Monday and Sunday.' }
    }
    if (weekdays.has(entry.weekday)) {
      return { valid: false, message: 'Duplicate day in operating hours is not allowed.' }
    }
    weekdays.add(entry.weekday)

    if (entry.is_closed) {
      continue
    }

    if (!isValidHHmm(entry.open_time) || !isValidHHmm(entry.close_time)) {
      return { valid: false, message: 'Open and close time must use HH:mm.' }
    }
    const openTime = entry.open_time as string
    const closeTime = entry.close_time as string
    if (toMinutes(openTime) >= toMinutes(closeTime)) {
      return { valid: false, message: 'Open time must be earlier than close time.' }
    }
  }

  return { valid: true }
}

export const mapOperatingHoursForCreatePayload = (entries: CostumerOperatingHours[]) =>
  sortOperatingHours(entries).map((entry) => ({
    weekday: entry.weekday,
    is_closed: Boolean(entry.is_closed),
    ...(entry.is_closed
      ? {}
      : {
          open_time: entry.open_time ?? DEFAULT_OPERATING_OPEN_TIME,
          close_time: entry.close_time ?? DEFAULT_OPERATING_CLOSE_TIME,
        }),
  }))

export const mapOperatingHoursForUpdatePayload = (entries: CostumerOperatingHours[]) =>
  sortOperatingHours(entries).map((entry) => ({
    client_id: entry.client_id,
    weekday: entry.weekday,
    is_closed: Boolean(entry.is_closed),
    ...(entry.is_closed
      ? {}
      : {
          open_time: entry.open_time ?? DEFAULT_OPERATING_OPEN_TIME,
          close_time: entry.close_time ?? DEFAULT_OPERATING_CLOSE_TIME,
        }),
  }))
