type ByClientIdMap<T> = {
  byClientId: Record<string, T>
  allIds: string[]
}

const isByClientIdMap = <T>(entry: unknown): entry is ByClientIdMap<T> => {
  if (!entry || typeof entry !== 'object') return false
  return 'byClientId' in entry && 'allIds' in entry
}

export const normalizeByClientIdArray = <T>(
  entry?: T | T[] | ByClientIdMap<T>,
): T[] => {
  if (!entry) return []
  if (Array.isArray(entry)) return entry
  if (isByClientIdMap<T>(entry)) {
    return entry.allIds.map((clientId) => entry.byClientId[clientId]).filter(Boolean)
  }
  return [entry]
}
