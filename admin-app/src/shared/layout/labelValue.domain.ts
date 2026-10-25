export const EMPTY_VALUE = '—'

export const formatValue = (value?: string | number | null) => {
  if (value == null) return EMPTY_VALUE
  if (typeof value === 'string' && value.trim() === '') return EMPTY_VALUE
  return value
}
