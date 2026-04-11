import type { OrderQueryFilters } from '../types/orderMeta'
import { normalizeQuery } from '@shared-utils'
import { orderStringFilters } from './orderFilterConfig'

const sortObjectDeep = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(sortObjectDeep)
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nextValue]) => [key, sortObjectDeep(nextValue)] as const)
    return Object.fromEntries(entries)
  }

  return value
}

export const buildOrderSelectionSnapshotQuery = (
  query: { q: string; filters: OrderQueryFilters },
): Record<string, unknown> =>
  normalizeQuery(query, orderStringFilters)

export const buildOrderSelectionSnapshotKey = (snapshotQuery: Record<string, unknown>): string =>
  JSON.stringify(sortObjectDeep(snapshotQuery))
