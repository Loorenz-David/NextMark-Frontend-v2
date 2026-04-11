export type QueryNormalizationInput = {
  q?: string
  filters?: Record<string, unknown> & {
    s?: string[]
  }
}

export const normalizeQuery = (
  query: QueryNormalizationInput,
  stringSet: ReadonlySet<string>,
): Record<string, unknown> => {
  const normalized: Record<string, unknown> = {}
  const queryFilters = (query.filters ?? {}) as Record<string, unknown> & { s?: string[] }

  const rawStringFilters = Array.isArray(queryFilters.s)
    ? queryFilters.s
    : []

  const expandedStringFilters: string[] = []

  for (const entry of rawStringFilters) {
    if (typeof entry !== 'string') continue

    if (entry.includes('/')) {
      const parts = entry.split('/').map((part) => part.trim())
      for (const part of parts) {
        if (stringSet.has(part)) {
          expandedStringFilters.push(part)
        }
      }
    } else if (stringSet.has(entry)) {
      expandedStringFilters.push(entry)
    }
  }

  const stringFilters = [...new Set(expandedStringFilters)]

  if (stringFilters.length > 0) {
    normalized.s = JSON.stringify(stringFilters)
  }

  if (typeof query.q === 'string') {
    const trimmedQuery = query.q.trim()
    if (trimmedQuery) {
      normalized.q = trimmedQuery
    }
  }

  for (const [key, value] of Object.entries(queryFilters)) {
    if (key === 's') continue
    if (value === undefined || value === null || value === '') continue

    if (key.includes('-in-')) {
      const [field, scope] = key.split('-in-').map((part) => part.trim())
      if (!field || !scope) continue

      if (
        !normalized[scope]
        || typeof normalized[scope] !== 'object'
        || Array.isArray(normalized[scope])
      ) {
        normalized[scope] = {}
      }

      ;(normalized[scope] as Record<string, unknown>)[field] = value
      continue
    }

    normalized[key] = value
  }

  return normalized
}
