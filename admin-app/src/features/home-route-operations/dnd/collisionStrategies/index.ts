import type { CollisionDetection } from '@dnd-kit/core'

import { orderCollision } from './orderCollision'
import { routeCollision } from './routeCollision'

const ORDER_DRAG_TYPES = new Set(['order', 'order_group', 'order_batch'])

export const homeCollisionDetection: CollisionDetection = (args) => {
  const activeType = String(args.active.data.current?.type ?? '')

  if (ORDER_DRAG_TYPES.has(activeType)) {
    return orderCollision(args)
  }

  return routeCollision(args)
}
