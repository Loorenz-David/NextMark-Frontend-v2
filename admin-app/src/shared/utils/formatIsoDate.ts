import { getTeamTimeZone } from './teamTimeZone'

export const formatIsoDate = (value: string | null | undefined) => {
  if (!value) return null
  const [datePart] = value.split('T')
  return datePart || null
}

export const formatDateOnlyInTimeZone = (
  value: string | Date | null | undefined,
  timeZone = getTeamTimeZone(),
) => {
  if (!value) return null

  const parsed = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(parsed.getTime())) return null

  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(parsed)

  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  const day = parts.find((part) => part.type === 'day')?.value

  if (!year || !month || !day) return null

  return `${year}-${month}-${day}`
}

const relativeTimeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

const RELATIVE_UNITS: Array<{
  unit: Intl.RelativeTimeFormatUnit
  seconds: number
}> = [
  { unit: 'year', seconds: 60 * 60 * 24 * 365 },
  { unit: 'month', seconds: 60 * 60 * 24 * 30 },
  { unit: 'week', seconds: 60 * 60 * 24 * 7 },
  { unit: 'day', seconds: 60 * 60 * 24 },
  { unit: 'hour', seconds: 60 * 60 },
  { unit: 'minute', seconds: 60 },
]

export const formatIsoDateRelative = (value: string | null | undefined) => {
  if (!value) return null

  const parsed = new Date(value)
  const parsedTime = parsed.getTime()
  if (Number.isNaN(parsedTime)) return null

  const timeZone = getTeamTimeZone()
  const zonedParsedTime = resolveZonedTime(parsed, timeZone)
  const zonedNowTime = resolveZonedTime(new Date(), timeZone)
  const diffSeconds = Math.round((zonedParsedTime - zonedNowTime) / 1000)

  if (Math.abs(diffSeconds) < 60) {
    return relativeTimeFormatter.format(0, 'second')
  }

  const unitConfig = RELATIVE_UNITS.find((entry) => Math.abs(diffSeconds) >= entry.seconds)
  if (!unitConfig) return relativeTimeFormatter.format(0, 'second')

  const amount = Math.round(diffSeconds / unitConfig.seconds)
  return relativeTimeFormatter.format(amount, unitConfig.unit)
}



export const getIsoWeekLabel = (dateInput?: string | null) => {
  if(!dateInput) return null
  const date = new Date(dateInput)
  if (Number.isNaN(date.getTime())) return 'v --'

  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = utcDate.getUTCDay() || 7
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((utcDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)

  return `v ${weekNo}`
}

export const formatIsoDateFriendly = (value?: string | null) => {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  const timeZone = getTeamTimeZone()
  return new Intl.DateTimeFormat('en', {
    timeZone,
    day: 'numeric',
    month: 'long', // "Mar" | change to "long" for "March"
  }).format(date)
}

export const formatIsoTime = (value?: string | null) => {
  if (!value) return null
  
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  const timeZone = getTeamTimeZone()
  return new Intl.DateTimeFormat('en', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // 24h format
  }).format(date)
}

const resolveZonedTime = (date: Date, timeZone: string) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date)

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ''

  return Date.parse(
    `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}Z`,
  )
}
