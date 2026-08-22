import type { CollisionDetection } from '@dnd-kit/core'

import { rankedPointerCollision } from './rankedPointerCollision'

// A route-shaped drag (an order already placed on a route) can land on
// everything an order-shaped drag can — including a calendar plan chip,
// which sits nested inside its day cell and, on multi-plan days, inside the
// floating overlay too. Without ranking, an unfiltered pointer collision can
// resolve to the day cell or the overlay's no-op catcher instead of the chip
// itself, silently swallowing the drop. See orderCollision for the same
// overlap and why `calendar-overlay`/`calendar-day` rank below the rest.
const TARGET_RANK: Record<string, number> = {
  plan: 0,
  'create-plan': 0,
  unschedule: 0,
  route_group_rail: 0,
  route_stop: 0,
  route_stop_group_drop: 0,
  route_stop_group: 0,
  'calendar-overlay': 1,
  'calendar-day': 2,
}

export const routeCollision: CollisionDetection = (args) =>
  rankedPointerCollision(args, TARGET_RANK)
