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

  return pointerCollisions.filter((collision) => {
    const container = containerById.get(String(collision.id))
    return container?.data.current?.type === 'plan'
  })
}
