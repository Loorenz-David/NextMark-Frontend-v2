import type { GroupPlacement } from './resolveGroupPlacement'

type ResolveMovePositionInput = {
  orderedStopClientIds: string[]
  movingStopClientIds: string[]
  anchorStopClientId: string | null | undefined
  placement: GroupPlacement
}

export const resolveMovePosition = ({
  orderedStopClientIds,
  movingStopClientIds,
  anchorStopClientId,
  placement,
}: ResolveMovePositionInput): number | null => {
  if (!orderedStopClientIds.length || !movingStopClientIds.length || !anchorStopClientId) {
    return null
  }

  const movingSet = new Set(movingStopClientIds)
  const movingInOrder = orderedStopClientIds.filter((clientId) => movingSet.has(clientId))
  if (!movingInOrder.length || movingInOrder.length !== movingSet.size) {
    return null
  }

  if (movingSet.has(anchorStopClientId)) {
    return null
  }

  const remaining = orderedStopClientIds.filter((clientId) => !movingSet.has(clientId))
  const anchorIndex = remaining.findIndex((clientId) => clientId === anchorStopClientId)
  if (anchorIndex < 0) {
    return null
  }

  const insertIndex = placement === 'before' ? anchorIndex : anchorIndex + 1

  const nextOrdered = [
    ...remaining.slice(0, insertIndex),
    ...movingInOrder,
    ...remaining.slice(insertIndex),
  ]

  const unchanged = nextOrdered.length === orderedStopClientIds.length
    && nextOrdered.every((clientId, index) => clientId === orderedStopClientIds[index])

  if (unchanged) {
    return null
  }

  return insertIndex + 1
}
