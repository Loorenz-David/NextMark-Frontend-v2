import type { FilterConfig } from '@/shared/searchBars'

const WORD_OVERRIDES: Record<string, string> = {
  id: 'ID',
}

export const ORDER_FILTER_LABEL_OVERRIDES: Record<string, string> = {
  plan_id: 'Plan ID',
  order_state: 'Order State',
  order_schedule_from: 'From',
  order_schedule_to: 'To',
}

const toStartCase = (value: string): string =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((word, index) => {
      const lowercaseWord = word.toLowerCase()
      const override = WORD_OVERRIDES[lowercaseWord]
      if (override) return override
      if (index === 0) return `${lowercaseWord.charAt(0).toUpperCase()}${lowercaseWord.slice(1)}`
      return lowercaseWord
    })
    .join(' ')

const humanizeFilterKey = (key: string): string => {
  const normalized = key
    .replace(/-in-/g, ' in ')
    .replace(/[_-]+/g, ' ')

  return toStartCase(normalized)
}

const buildConfigLabelMap = (config: FilterConfig[]): Record<string, string> => {
  return config.reduce<Record<string, string>>((acc, filter) => {
    if (filter.type === 'option' || filter.type === 'number-list' || filter.type === 'popup-multi-select') {
      acc[filter.key] = filter.label
    }
    if (filter.type === 'date-range' || filter.type === 'popup-date-range') {
      acc[filter.keyStart] = `${filter.label} from`
      acc[filter.keyEnd] = `${filter.label} to`
    }
    return acc
  }, {})
}

export const createOrderFilterLabelFormatter = (
  config: FilterConfig[],
  overrides: Record<string, string> = ORDER_FILTER_LABEL_OVERRIDES,
) => {
  const configLabelMap = buildConfigLabelMap(config)
  const labelOnlyKeys = new Set(['schedule_order', 'unschedule_order', 'show_archived'])

  return (key: string, value?: unknown): string => {
    if (key === 's' && typeof value === 'string') {
      if (configLabelMap[value]) return configLabelMap[value]
      if (overrides[value]) return overrides[value]
      return humanizeFilterKey(value)
    }

    const baseLabel = configLabelMap[key] ?? overrides[key] ?? humanizeFilterKey(key)
    if (value === undefined || value === null || value === '') {
      return baseLabel
    }

    if (labelOnlyKeys.has(key)) {
      return baseLabel
    }

    if (key === 'order_state') {
      return String(value)
    }

    if (key === 'order_schedule_from' || key === 'order_schedule_to') {
      return `${baseLabel}: ${String(value)}`
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return `${baseLabel}: ${String(value)}`
    }

    if (Array.isArray(value)) {
      return `${baseLabel}: ${value.map((item) => String(item)).join(', ')}`
    }

    return `${baseLabel}: ${String(value)}`
  }
}
