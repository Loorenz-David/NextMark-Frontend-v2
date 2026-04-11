import { buildClientId } from '@/lib/utils/clientId'
import { apiClient } from '@/lib/api/ApiClient'
import type { CostumerOperatingHours } from '@/features/costumer'

import type { OrderDeliveryWindow } from '../../../types/order'

const TIME_PARTS_FORMATTER_CACHE = new Map<string, Intl.DateTimeFormat>()

export const MAX_ORDER_DELIVERY_WINDOWS = 14
export const FULL_RANGE_WINDOW_TYPE = 'FULL_RANGE'

type LocalDateTimeParts = {
  date: string
  time: string
}

export type DeliveryWindowDisplayRow = {
  key: string
  date: string
  start: string
  end: string
  windowType: OrderDeliveryWindow['window_type']
  startAtUtc: string
  endAtUtc: string
  clientId: string | null
}

export const resolveOrderFormTimeZone = () => {
  const sessionTimeZone = apiClient.getSessionTimeZone()
  if (sessionTimeZone) {
    return sessionTimeZone
  }
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
}

export const sortDeliveryWindowsUtc = (windows: OrderDeliveryWindow[]) =>
  [...windows].sort((left, right) => {
    const leftStart = Date.parse(left.start_at)
    const rightStart = Date.parse(right.start_at)
    if (leftStart !== rightStart) {
      return leftStart - rightStart
    }
    return Date.parse(left.end_at) - Date.parse(right.end_at)
  })

export const validateNonOverlappingUtcDeliveryWindows = (windows: OrderDeliveryWindow[]) => {
  const sorted = sortDeliveryWindowsUtc(windows)
  for (let index = 1; index < sorted.length; index += 1) {
    const previous = sorted[index - 1]
    const current = sorted[index]
    if (Date.parse(current.start_at) < Date.parse(previous.end_at)) {
      return {
        valid: false,
        message: 'Delivery windows cannot overlap.',
      }
    }
  }
  return { valid: true as const }
}

export const toDeliveryWindowDisplayRows = (
  windows: OrderDeliveryWindow[],
  timeZone: string,
): DeliveryWindowDisplayRow[] =>
  sortDeliveryWindowsUtc(windows)
    .flatMap((window) => {
      const start = toLocalDateTimeParts(window.start_at, timeZone)
      const end = toLocalDateTimeParts(window.end_at, timeZone)
      if (!start || !end) {
        return []
      }
      return [{
        key: window.client_id ?? `${window.start_at}-${window.end_at}`,
        date: start.date,
        start: start.time,
        end: end.time,
        windowType: window.window_type,
        startAtUtc: window.start_at,
        endAtUtc: window.end_at,
        clientId: window.client_id ?? null,
      }]
    })
    .sort((left, right) => {
      if (left.date !== right.date) {
        return left.date.localeCompare(right.date)
      }
      if (left.start !== right.start) {
        return left.start.localeCompare(right.start)
      }
      return left.end.localeCompare(right.end)
    })

export const expandCalendarSelectionToLocalDates = ({
  mode,
  value,
  timeZone,
}: {
  mode: 'single' | 'multiple' | 'range'
  value: Date | Date[] | { start: Date | null; end: Date | null } | null
  timeZone: string
}) => {
  if (!value) return []

  if (mode === 'single') {
    return value instanceof Date ? [formatDateInTimeZone(value, timeZone)] : []
  }

  if (mode === 'multiple') {
    return Array.isArray(value)
      ? dedupeDateValues(value.map((entry) => formatDateInTimeZone(entry, timeZone)))
      : []
  }

  if (isCalendarRangeValue(value) && value.start && value.end) {
    return buildDateRange(
      formatDateInTimeZone(value.start, timeZone),
      formatDateInTimeZone(value.end, timeZone),
    )
  }

  return []
}

export const buildWindowsFromLocalDates = ({
  localDates,
  startTime,
  endTime,
  existingWindows,
  operatingHours,
  timeZone,
}: {
  localDates: string[]
  startTime: string | null
  endTime: string | null
  existingWindows: OrderDeliveryWindow[]
  operatingHours: CostumerOperatingHours[]
  timeZone: string
}) => {
  if (!localDates.length) {
    return {
      nextWindows: existingWindows,
      skippedClosedDates: [] as string[],
      error: 'Select at least one date.',
    }
  }

  const nextRows: OrderDeliveryWindow[] = []
  const skippedClosedDates: string[] = []
  const uniqueDates = dedupeDateValues(localDates)

  for (const localDate of uniqueDates) {
    const availability = resolveOperatingDayAvailability({
      localDate,
      operatingHours,
    })

    if (!availability.selectable) {
      skippedClosedDates.push(localDate)
      continue
    }

    const minimumStart = availability.openTime ?? '00:00'
    const maximumEnd = availability.closeTime ?? '23:59'
    const resolvedStart = clampTime(startTime ?? minimumStart, minimumStart, maximumEnd)
    const resolvedEnd = clampTime(endTime ?? maximumEnd, minimumStart, maximumEnd)

    if (resolvedEnd <= resolvedStart) {
      return {
        nextWindows: existingWindows,
        skippedClosedDates,
        error: `Invalid time range for ${localDate}. End time must be after start time.`,
      }
    }

    const startUtc = localDateTimeToUtcIso(localDate, resolvedStart, timeZone)
    const endUtc = localDateTimeToUtcIso(localDate, resolvedEnd, timeZone)
    if (!startUtc || !endUtc) {
      return {
        nextWindows: existingWindows,
        skippedClosedDates,
        error: `Invalid local time for ${localDate} in timezone ${timeZone}.`,
      }
    }

    const startEpoch = Date.parse(startUtc)
    const endEpoch = Date.parse(endUtc)
    if (startEpoch < Date.now() || endEpoch <= Date.now()) {
      return {
        nextWindows: existingWindows,
        skippedClosedDates,
        error: `Invalid time window for ${localDate}. Time windows cannot be in the past.`,
      }
    }

    nextRows.push({
      client_id: buildClientId('order_delivery_window'),
      start_at: startUtc,
      end_at: endUtc,
      window_type: FULL_RANGE_WINDOW_TYPE,
    })
  }

  const merged = sortDeliveryWindowsUtc([...existingWindows, ...nextRows])
  if (merged.length > MAX_ORDER_DELIVERY_WINDOWS) {
    return {
      nextWindows: existingWindows,
      skippedClosedDates,
      error: `Maximum ${MAX_ORDER_DELIVERY_WINDOWS} delivery windows allowed.`,
    }
  }

  const overlapValidation = validateNonOverlappingUtcDeliveryWindows(merged)
  if (!overlapValidation.valid) {
    return {
      nextWindows: existingWindows,
      skippedClosedDates,
      error: overlapValidation.message,
    }
  }

  return {
    nextWindows: merged,
    skippedClosedDates,
    error: null,
  }
}

export const removeDeliveryWindowAtIndex = (
  windows: OrderDeliveryWindow[],
  index: number,
) => windows.filter((_, cursor) => cursor !== index)

export const formatDateInTimeZone = (value: Date, timeZone: string) => {
  const parts = formatToParts(value, timeZone)
  return `${parts.year}-${parts.month}-${parts.day}`
}

export const toLocalDateTimeParts = (value: string | Date, timeZone: string): LocalDateTimeParts | null => {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return null
  }
  const parts = formatToParts(date, timeZone)
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
  }
}

export const localDateTimeToUtcIso = (
  localDate: string,
  localTime: string,
  timeZone: string,
) => {
  const parsedDate = parseIsoDate(localDate)
  const parsedTime = parseHHmm(localTime)
  if (!parsedDate || !parsedTime) {
    return null
  }

  const [year, month, day] = parsedDate
  const [hour, minute] = parsedTime
  const desiredEpoch = Date.UTC(year, month - 1, day, hour, minute, 0, 0)
  let guessEpoch = desiredEpoch

  for (let i = 0; i < 4; i += 1) {
    const offset = getTimeZoneOffsetMs(new Date(guessEpoch), timeZone)
    const next = desiredEpoch - offset
    if (next === guessEpoch) {
      break
    }
    guessEpoch = next
  }

  const candidate = new Date(guessEpoch)
  const localized = toLocalDateTimeParts(candidate, timeZone)
  const expectedTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
  if (!localized || localized.date !== localDate || localized.time !== expectedTime) {
    return null
  }
  return candidate.toISOString()
}

const getTimeZoneOffsetMs = (date: Date, timeZone: string) => {
  const parts = formatToParts(date, timeZone)
  const localizedUtcEpoch = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
    0,
  )
  return localizedUtcEpoch - date.getTime()
}

export const resolveOperatingDayAvailability = ({
  localDate,
  operatingHours,
}: {
  localDate: string
  operatingHours: CostumerOperatingHours[]
}) => {
  const weekday = toWeekdayMonday(localDate)
  const row = operatingHours.find((entry) => entry.weekday === weekday)
  if (!row) {
    return { selectable: true, openTime: '00:00', closeTime: '23:59', isClosed: false }
  }
  if (row.is_closed) {
    return { selectable: false, openTime: null, closeTime: null, isClosed: true }
  }

  const openTime = normalizeHHmm(row.open_time) ?? '00:00'
  const closeTime = normalizeHHmm(row.close_time) ?? '23:59'
  return { selectable: true, openTime, closeTime, isClosed: false }
}

export const isDayClosedByOperatingHours = ({
  date,
  operatingHours,
  timeZone,
}: {
  date: Date
  operatingHours: CostumerOperatingHours[]
  timeZone: string
}) => {
  const localDate = formatDateInTimeZone(date, timeZone)
  return resolveOperatingDayAvailability({ localDate, operatingHours }).isClosed
}

const toWeekdayMonday = (isoDate: string) => {
  const [year, month, day] = parseIsoDate(isoDate) ?? []
  if (!year || !month || !day) return 0
  const jsWeekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay()
  return (jsWeekday + 6) % 7
}

const clampTime = (value: string, min: string, max: string) => {
  if (value < min) return min
  if (value > max) return max
  return value
}

const dedupeDateValues = (values: string[]) => [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b))

const buildDateRange = (startDate: string, endDate: string) => {
  if (!startDate || !endDate) return []
  if (endDate < startDate) return []

  const start = parseIsoDate(startDate)
  const end = parseIsoDate(endDate)
  if (!start || !end) return []
  const [startYear, startMonth, startDay] = start
  const [endYear, endMonth, endDay] = end
  const current = new Date(Date.UTC(startYear, startMonth - 1, startDay))
  const endValue = new Date(Date.UTC(endYear, endMonth - 1, endDay))
  const values: string[] = []

  while (current.getTime() <= endValue.getTime()) {
    values.push(current.toISOString().slice(0, 10))
    current.setUTCDate(current.getUTCDate() + 1)
  }
  return values
}

const parseIsoDate = (value: string): [number, number, number] | null => {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) {
    return null
  }
  return [year, month, day]
}

const parseHHmm = (value: string): [number, number] | null => {
  const normalized = normalizeHHmm(value)
  if (!normalized) return null
  const [hour, minute] = normalized.split(':').map(Number)
  return [hour, minute]
}

const normalizeHHmm = (value: string | null | undefined) => {
  if (!value) return null
  const match = String(value).trim().match(/^([01]\d|2[0-3]):([0-5]\d)$/)
  if (!match) return null
  return `${match[1]}:${match[2]}`
}

const isCalendarRangeValue = (
  value: Date | Date[] | { start: Date | null; end: Date | null } | null,
): value is { start: Date | null; end: Date | null } => {
  const candidate = value
  if (!candidate || Array.isArray(candidate) || candidate instanceof Date) {
    return false
  }
  return typeof candidate === 'object' && 'start' in candidate && 'end' in candidate
}

const formatToParts = (date: Date, timeZone: string) => {
  const key = `parts:${timeZone}`
  let formatter = TIME_PARTS_FORMATTER_CACHE.get(key)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    })
    TIME_PARTS_FORMATTER_CACHE.set(key, formatter)
  }
  const parts = formatter.formatToParts(date)

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ''
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
    second: get('second'),
  }
}
