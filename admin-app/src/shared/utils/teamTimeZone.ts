import { apiClient } from '@/lib/api/ApiClient'

type TeamTimeZoneOptions = {
  forceTeamTimeZone?: boolean
  timeZone?: string | null
}

type TeamTimeZoneTimeOptions = TeamTimeZoneOptions & {
  referenceDate?: string | Date | null
}

const ISO_FORMATTER_CACHE = new Map<string, Intl.DateTimeFormat>()
const TIME_FORMATTER_CACHE = new Map<string, Intl.DateTimeFormat>()

export const getTeamTimeZone = () => {
  return (
    apiClient.getSessionTimeZone()
    || Intl.DateTimeFormat().resolvedOptions().timeZone
    || 'UTC'
  )
}

export const formatIsoToTeamTimeZone = (
  value: string | Date | null | undefined,
  options: TeamTimeZoneOptions = {},
): string => {
  if (!value) {
    return ''
  }

  const parsed = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return typeof value === 'string' ? value : ''
  }

  const timeZone = resolveTimeZone(options.timeZone)
  const shouldConvert = value instanceof Date || options.forceTeamTimeZone || isUtcLikeValue(value)
  if (!shouldConvert) {
    return typeof value === 'string' ? value : parsed.toISOString()
  }

  const parts = getIsoFormatter(timeZone).formatToParts(parsed)
  const year = getPart(parts, 'year')
  const month = getPart(parts, 'month')
  const day = getPart(parts, 'day')
  const hour = getPart(parts, 'hour')
  const minute = getPart(parts, 'minute')
  const second = getPart(parts, 'second')

  if (!year || !month || !day || !hour || !minute || !second) {
    return typeof value === 'string' ? value : parsed.toISOString()
  }

  return `${year}-${month}-${day}T${hour}:${minute}:${second}`
}

export const formatHhmmToTeamTimeZone = (
  value: string | null | undefined,
  options: TeamTimeZoneTimeOptions = {},
): string => {
  if (!value) {
    return ''
  }

  const normalized = normalizeHhmm(value)
  if (!normalized) {
    return value
  }

  const timeZone = resolveTimeZone(options.timeZone)
  const shouldConvert = options.forceTeamTimeZone || isUtcHhmm(value)
  if (!shouldConvert) {
    return normalized
  }

  const referenceDate = resolveReferenceDate(options.referenceDate)
  const [hours, minutes] = normalized.split(':').map(Number)
  const utcDate = new Date(Date.UTC(
    referenceDate.getUTCFullYear(),
    referenceDate.getUTCMonth(),
    referenceDate.getUTCDate(),
    hours,
    minutes,
    0,
    0,
  ))

  return getTimeFormatter(timeZone).format(utcDate)
}

const resolveTimeZone = (timeZone?: string | null) => {
  return (typeof timeZone === 'string' && timeZone.trim()) ? timeZone.trim() : getTeamTimeZone()
}

const getIsoFormatter = (timeZone: string) => {
  const cacheKey = `iso:${timeZone}`
  let formatter = ISO_FORMATTER_CACHE.get(cacheKey)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('sv-SE', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
    ISO_FORMATTER_CACHE.set(cacheKey, formatter)
  }
  return formatter
}

const getTimeFormatter = (timeZone: string) => {
  const cacheKey = `time:${timeZone}`
  let formatter = TIME_FORMATTER_CACHE.get(cacheKey)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('sv-SE', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    TIME_FORMATTER_CACHE.set(cacheKey, formatter)
  }
  return formatter
}

const getPart = (parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) =>
  parts.find((part) => part.type === type)?.value ?? null

const isUtcLikeValue = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) {
    return false
  }
  return /(?:Z|[+-]00:00)$/i.test(trimmed)
}

const normalizeHhmm = (value: string) => {
  const trimmed = value.trim()
  const match = trimmed.match(/^(\d{2}):(\d{2})(?::\d{2})?$/)
  if (!match) {
    return null
  }

  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

const isUtcHhmm = (_value: string) => true

const resolveReferenceDate = (value?: string | Date | null) => {
  if (!value) {
    return new Date()
  }

  const parsed = value instanceof Date ? value : new Date(value)
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}
