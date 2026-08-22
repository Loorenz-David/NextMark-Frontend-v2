import type { CollisionDetection } from '@dnd-kit/core'

import { rankedPointerCollision } from './rankedPointerCollision'

// Lower rank wins when targets overlap: plan cards/chips beat the floating
// day overlay (a no-op catcher between its cards), which beats the day
// cells sitting underneath the floating panel.
//
// A target type missing from this map is dropped entirely, not ranked last —
// so every droppable an order-shaped drag may land on has to be listed here.
// `unschedule` lives in the plan header and never overlaps the others.
const TARGET_RANK: Record<string, number> = {
  plan: 0,
  'create-plan': 0,
  unschedule: 0,
  'calendar-overlay': 1,
  'calendar-day': 2,
}

export const orderCollision: CollisionDetection = (args) =>
  rankedPointerCollision(args, TARGET_RANK)
