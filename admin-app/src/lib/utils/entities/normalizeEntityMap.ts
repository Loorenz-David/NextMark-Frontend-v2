



export type EntityMap<T extends { client_id: string }> = {
  byClientId: Record<string, T>
  allIds: string[]
}

export const normalizeEntityMap = <T extends { client_id: string }>(
  payload: EntityMap<T> | T | Record<string, T> | null | undefined,
): EntityMap<T> | null => {
  if (!payload) return null
  if (typeof payload !== 'object') return null

  if ('byClientId' in payload && 'allIds' in payload) {
    return payload as EntityMap<T>
  }

  if ('client_id' in payload) {
    const item = payload as T
    return {
      byClientId: { [item.client_id]: item },
      allIds: [item.client_id],
    }
  }

  const record = payload as Record<string, T>
  const ids = Object.keys(record)
  if (!ids.length) return null

  return {
    byClientId: record,
    allIds: ids,
  }
}