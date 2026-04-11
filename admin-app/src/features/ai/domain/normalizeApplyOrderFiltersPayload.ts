import type { OrderQueryFilters } from '@/features/order/types/orderMeta'

type ApplyOrderFiltersMode = 'replace' | 'merge'

export type ApplyOrderFiltersPayload = {
  mode?: ApplyOrderFiltersMode
  search?: string
  filters?: Partial<OrderQueryFilters>
}

export type NormalizedApplyOrderFiltersPayload = {
  mode?: ApplyOrderFiltersMode
  search?: string
  filters: Partial<Omit<OrderQueryFilters, 'q'>>
}

export function normalizeApplyOrderFiltersPayload(
  payload: ApplyOrderFiltersPayload | undefined,
): NormalizedApplyOrderFiltersPayload {
  const rawFilters = payload?.filters ?? {}
  const { q: legacySearchInFilters, ...filtersWithoutSearch } = rawFilters

  // Contract precedence: explicit payload.search wins when non-empty.
  // If search is empty (""), treat it as absent and fall back to legacy filters.q.
  const hasExplicitSearch = typeof payload?.search === 'string' && payload.search.trim().length > 0
  const search =
    hasExplicitSearch
      ? payload?.search
      : typeof legacySearchInFilters === 'string'
        ? legacySearchInFilters
        : undefined

  const filters = Object.fromEntries(
    Object.entries(filtersWithoutSearch).filter(([, value]) => value !== undefined),
  ) as Partial<Omit<OrderQueryFilters, 'q'>>

  return {
    mode: payload?.mode,
    search,
    filters,
  }
}
