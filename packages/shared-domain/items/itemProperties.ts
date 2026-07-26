import type { ItemProperty, ItemPropertyValue } from './item'

const toItemPropertyValue = (value: unknown): ItemPropertyValue => {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value
  }
  if (value == null) {
    return null
  }
  return String(value)
}

const isPropertyEntry = (entry: Record<string, unknown>): boolean =>
  typeof entry.name === 'string' && 'value' in entry

// Canonical backend shape is a list of { name, value } dicts. Legacy rows
// written by the old admin form hold a flat { name: value } record instead —
// both shapes normalize to ItemProperty[].
export const normalizeItemProperties = (input: unknown): ItemProperty[] | null => {
  if (input == null) {
    return null
  }

  if (Array.isArray(input)) {
    const entries = input.flatMap((entry): ItemProperty[] => {
      if (entry == null || typeof entry !== 'object' || Array.isArray(entry)) {
        return []
      }
      const record = entry as Record<string, unknown>
      if (isPropertyEntry(record)) {
        return [{ name: record.name as string, value: toItemPropertyValue(record.value) }]
      }
      return Object.entries(record).map(([name, value]) => ({
        name,
        value: toItemPropertyValue(value),
      }))
    })
    return entries.length ? entries : null
  }

  if (typeof input === 'object') {
    const entries = Object.entries(input as Record<string, unknown>).map(([name, value]) => ({
      name,
      value: toItemPropertyValue(value),
    }))
    return entries.length ? entries : null
  }

  return null
}
