import type { CollisionDetection } from '@dnd-kit/core'
import { pointerWithin } from '@dnd-kit/core'

const resolveContainerMap = (containers: Parameters<CollisionDetection>[0]['droppableContainers']) => {
  const byId = new Map<string, (typeof containers)[number]>()
  containers.forEach((container) => {
    byId.set(String(container.id), container)
  })
  return byId
}

/**
 * Filters pointer collisions down to the given target types and orders them
 * by rank, lowest first. Calendar droppables overlap (a plan chip sits inside
 * its day cell, a day's floating overlay sits over the cells beneath it), so
 * an unranked `pointerWithin` can resolve to the wrong one of several
 * simultaneously-colliding targets.
 *
 * A target type missing from `targetRank` is dropped entirely, not ranked
 * last — every droppable a given drag shape may land on has to be listed.
 */
export const rankedPointerCollision = (
  args: Parameters<CollisionDetection>[0],
  targetRank: Record<string, number>,
): ReturnType<CollisionDetection> => {
  const pointerCollisions = pointerWithin(args)
  if (!pointerCollisions.length) return []

  const containerById = resolveContainerMap(args.droppableContainers)
  const resolveTargetType = (collisionId: unknown) =>
    containerById.get(String(collisionId))?.data.current?.type

  const allowed = pointerCollisions.filter((collision) => {
    const targetType = resolveTargetType(collision.id)
    return typeof targetType === 'string' && targetType in targetRank
  })

  return allowed.sort((left, right) => {
    const leftRank = targetRank[String(resolveTargetType(left.id))]
    const rightRank = targetRank[String(resolveTargetType(right.id))]
    return leftRank - rightRank
  })
}
