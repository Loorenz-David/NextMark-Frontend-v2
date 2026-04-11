import type { OrderStates } from './orderState'

const LINEAR_TRANSITION_STATES: OrderStates[] = [
  'Draft',
  'Confirmed',
  'Preparing',
  'Ready',
  'Processing',
  'Completed',
]

const TERMINAL_STATES = new Set<OrderStates>(['Completed', 'Cancelled', 'Fail'])
const LINEAR_STATE_INDEX = new Map<OrderStates, number>(
  LINEAR_TRANSITION_STATES.map((state, index) => [state, index]),
)

export const getNextOrderStateName = (current: OrderStates): OrderStates | null => {
  if (TERMINAL_STATES.has(current)) return null

  const currentIndex = LINEAR_STATE_INDEX.get(current)
  if (currentIndex == null) return null

  return LINEAR_TRANSITION_STATES[currentIndex + 1] ?? null
}

export const isTransitionAllowed = (from: OrderStates, to: OrderStates): boolean => {
  if (TERMINAL_STATES.has(from)) return false
  if (from === to) return true

  const fromIndex = LINEAR_STATE_INDEX.get(from)
  const toIndex = LINEAR_STATE_INDEX.get(to)
  if (fromIndex == null || toIndex == null) return false

  return toIndex > fromIndex
}
