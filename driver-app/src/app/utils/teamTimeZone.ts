import { driverApiClient } from '../services/client'

type TeamTimeZoneOptions = {
  timeZone?: string | null
}

type TeamDateOptions = TeamTimeZoneOptions & {
  locale?: string
  treatAsDateOnly?: boolean
}

type TeamTimeOptions = TeamTimeZoneOptions & {
  locale?: string
}

type TeamDateTimeOptions = TeamTimeZoneOptions & {
  locale?: string
  dateStyle?: 'full' | 'long' | 'medium' | 'short'
  timeStyle?: 'full' | 'long' | 'medium' | 'short'
}

type TeamDateRangeOptions = TeamDateOptions

const DATE_FORMATTER_CACHE = new Map<string, Intl.DateTimeFormat>()
const TIME_FORMATTER_CACHE = new Map<string, Intl.DateTimeFormat>()
const DATE_TIME_FORMATTER_CACHE = new Map<string, Intl.DateTimeFormat>()
const PLAIN_DATE_FORMATTER_CACHE = new Map<string, Intl.DateTimeFormat>()

export function getTeamTimeZone() {
  return (
    driverApiClient.getSessionTimeZone()
    || Intl.DateTimeFormat().resolvedOptions().timeZone
    || 'UTC'
  )
}

export function formatIsoToTeamDate(
  value: string | Date | null | undefined,
  options: TeamDateOptions = {},
): string | null {
  if (!value) {
    return null
  }

  const locale = options.locale ?? 'en-US'
  const timeZone = resolveTimeZone(options.timeZone)
  const treatAsDateOnly = options.treatAsDateOnly ?? isDateOnlyLikeValue(value)

  if (treatAsDateOnly) {
    const plainDate = extractPlainDateParts(value)
    if (!plainDate) {
      return typeof value === 'string' ? value : null
    }

    return getPlainDateFormatter(locale).format(
      new Date(Date.UTC(plainDate.year, plainDate.month - 1, plainDate.day, 12, 0, 0, 0)),
    )
  }

  const parsed = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return typeof value === 'string' ? value : null
  }

  return getDateFormatter(locale, timeZone).format(parsed)
}

export function formatIsoToTeamTime(
  value: string | Date | null | undefined,
  options: TeamTimeOptions = {},
): string | null {
  if (!value) {
    return null
  }

  const parsed = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return typeof value === 'string' ? value : null
  }

  const locale = options.locale ?? 'sv-SE'
  const timeZone = resolveTimeZone(options.timeZone)
  return getTimeFormatter(locale, timeZone).format(parsed)
}

export function formatIsoToTeamDateTime(
  value: string | Date | null | undefined,
  options: TeamDateTimeOptions = {},
): string | null {
  if (!value) {
    return null
  }

  const parsed = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return typeof value === 'string' ? value : null
  }

  const locale = options.locale ?? 'sv-SE'
  const timeZone = resolveTimeZone(options.timeZone)
  const dateStyle = options.dateStyle ?? 'medium'
  const timeStyle = options.timeStyle ?? 'short'
  return getDateTimeFormatter(locale, timeZone, dateStyle, timeStyle).format(parsed)
}

export function formatDateRangeInTeamTimeZone(
  options: {
    startDate: string | null
    endDate: string | null
  } & TeamDateRangeOptions,
) {
  const formattedStartDate = formatIsoToTeamDate(options.startDate, {
    locale: options.locale,
    timeZone: options.timeZone,
    treatAsDateOnly: true,
  })
  const formattedEndDate = formatIsoToTeamDate(options.endDate, {
    locale: options.locale,
    timeZone: options.timeZone,
    treatAsDateOnly: true,
  })

  if (!formattedStartDate && !formattedEndDate) {
    return 'Schedule unavailable'
  }

  if (!formattedEndDate || formattedStartDate === formattedEndDate) {
    return formattedStartDate ?? formattedEndDate ?? 'Schedule unavailable'
  }

  if (!formattedStartDate) {
    return formattedEndDate
  }

  return `${formattedStartDate} - ${formattedEndDate}`
}

function resolveTimeZone(timeZone?: string | null) {
  return typeof timeZone === 'string' && timeZone.trim() ? timeZone.trim() : getTeamTimeZone()
}

function extractPlainDateParts(value: string | Date) {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return null
    }

    return {
      year: value.getUTCFullYear(),
      month: value.getUTCMonth() + 1,
      day: value.getUTCDate(),
    }
  }

  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T)/)
  if (!match) {
    return null
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null
  }

  return { year, month, day }
}

function isDateOnlyLikeValue(value: string | Date) {
  if (value instanceof Date) {
    return false
  }

  const trimmed = value.trim()
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed)
}

function getDateFormatter(locale: string, timeZone: string) {
  const cacheKey = `${locale}:${timeZone}`
  let formatter = DATE_FORMATTER_CACHE.get(cacheKey)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, {
      timeZone,
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    DATE_FORMATTER_CACHE.set(cacheKey, formatter)
  }
  return formatter
}

function getTimeFormatter(locale: string, timeZone: string) {
  const cacheKey = `${locale}:${timeZone}`
  let formatter = TIME_FORMATTER_CACHE.get(cacheKey)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    TIME_FORMATTER_CACHE.set(cacheKey, formatter)
  }
  return formatter
}

function getDateTimeFormatter(
  locale: string,
  timeZone: string,
  dateStyle: 'full' | 'long' | 'medium' | 'short',
  timeStyle: 'full' | 'long' | 'medium' | 'short',
) {
  const cacheKey = `${locale}:${timeZone}:${dateStyle}:${timeStyle}`
  let formatter = DATE_TIME_FORMATTER_CACHE.get(cacheKey)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, {
      timeZone,
      dateStyle,
      timeStyle,
    })
    DATE_TIME_FORMATTER_CACHE.set(cacheKey, formatter)
  }
  return formatter
}

function getPlainDateFormatter(locale: string) {
  let formatter = PLAIN_DATE_FORMATTER_CACHE.get(locale)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, {
      timeZone: 'UTC',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    PLAIN_DATE_FORMATTER_CACHE.set(locale, formatter)
  }
  return formatter
}
