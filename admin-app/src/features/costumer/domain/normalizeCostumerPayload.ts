import type { Costumer, CostumerMap } from '../dto/costumer.dto'

const isCostumerMap = (value: unknown): value is CostumerMap =>
  Boolean(value && typeof value === 'object' && 'byClientId' in value && 'allIds' in value)

const isCostumer = (value: unknown): value is Costumer =>
  Boolean(
    value && typeof value === 'object' && 'client_id' in value && 'first_name' in value && 'last_name' in value,
  )

export const normalizeCostumerPayload = (payload: CostumerMap | Costumer[] | Costumer): CostumerMap => {
  if (isCostumerMap(payload)) {
    return payload
  }

  if (Array.isArray(payload)) {
    const byClientId = payload.reduce<Record<string, Costumer>>((acc, entry) => {
      if (!isCostumer(entry)) return acc
      acc[entry.client_id] = entry
      return acc
    }, {})
    return { byClientId, allIds: Object.keys(byClientId) }
  }

  if (!isCostumer(payload)) {
    return { byClientId: {}, allIds: [] }
  }

  return {
    byClientId: { [payload.client_id]: payload },
    allIds: [payload.client_id],
  }
}
