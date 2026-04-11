import type { CollisionDetection } from '@dnd-kit/core'
import { pointerWithin } from '@dnd-kit/core'

export const routeCollision: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args)
  return pointerCollisions
}
