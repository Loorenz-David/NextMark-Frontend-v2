import type { CollisionDetection } from '@dnd-kit/core'
import { pointerWithin } from '@dnd-kit/core'

const resolveContainerMap = (containers: Parameters<CollisionDetection>[0]['droppableContainers']) => {
  const byId = new Map<string, (typeof containers)[number]>()
  containers.forEach((container) => {
    byId.set(String(container.id), container)
  })
  return byId
}

export const orderCollision: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args)
  if (!pointerCollisions.length) return []

  const containerById = resolveContainerMap(args.droppableContainers)

  const resolveTargetType = (collisionId: unknown) =>
    containerById.get(String(collisionId))?.data.current?.type

  // Lower rank wins when targets overlap: plan cards/chips beat the floating
  // day overlay (a no-op catcher between its cards), which beats the day
  // cells sitting underneath the floating panel.
  const TARGET_RANK: Record<string, number> = {
    plan: 0,
    'create-plan': 0,
    'calendar-overlay': 1,
    'calendar-day': 2,
  }

  const allowed = pointerCollisions.filter((collision) => {
    const targetType = resolveTargetType(collision.id)
    return typeof targetType === 'string' && targetType in TARGET_RANK
  })

  return allowed.sort((left, right) => {
    const leftRank = TARGET_RANK[String(resolveTargetType(left.id))] ?? 3
    const rightRank = TARGET_RANK[String(resolveTargetType(right.id))] ?? 3
    return leftRank - rightRank
  })
}
