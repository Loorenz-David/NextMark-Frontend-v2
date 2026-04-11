export type PickerFormat = '24h' | '12h'
export type Period = 'AM' | 'PM'

export type TimeValue = {
  hour: number
  minute: number
}

export type TimeDraft = {
  value: TimeValue
  isValid: boolean
}

export type TimeSegment24h = 'hour' | 'minute'
export type TimeSegment12h = 'hour' | 'minute' | 'period'
export type TimeSegment = TimeSegment24h | TimeSegment12h

export const HOURS_24 = Array.from({ length: 24 }, (_, index) => index)
export const HOURS_12 = Array.from({ length: 12 }, (_, index) => index + 1)
export const MINUTES = Array.from({ length: 60 }, (_, index) => index)
export const PERIODS: Period[] = ['AM', 'PM']

export const DEFAULT_TIME_VALUE: TimeValue = {
  hour: 0,
  minute: 0,
}
