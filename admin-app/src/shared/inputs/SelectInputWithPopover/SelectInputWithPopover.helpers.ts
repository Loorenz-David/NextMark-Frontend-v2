import type { SelectDisplayMode, SelectOption } from './SelectInputWithPopover.types'

const toValueText = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (value == null) return ''

  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

export const formatOptionText = (
  option: Pick<SelectOption<unknown>, 'label' | 'value'>,
  displayMode: SelectDisplayMode,
): string => {
  const valueText = toValueText(option.value)

  if (displayMode === 'value') {
    return valueText
  }
  if (displayMode === 'label-value') {
    return `${option.label} (${valueText})`
  }
  return option.label
}

export const filterOptions = <TValue,>(
  options: SelectOption<TValue>[],
  query: string,
): SelectOption<TValue>[] => {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) {
    return options
  }

  return options.filter((option) => {
    const label = option.label.toLowerCase()
    const value = toValueText(option.value).toLowerCase()
    return label.includes(normalizedQuery) || value.includes(normalizedQuery)
  })
}

export const normalizeSingleValue = <TValue,>(
  value: TValue | string | null | undefined,
): TValue | string =>
  value ?? ''

export const normalizeMultiValue = <TValue,>(value: TValue[]): TValue[] =>
  Array.isArray(value) ? value : []
