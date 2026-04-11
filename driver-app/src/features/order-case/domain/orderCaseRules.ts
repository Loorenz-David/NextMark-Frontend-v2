import type { OrderCase, OrderCaseState } from './orderCase.types'

const ALLOWED_NEXT_STATES: Record<OrderCaseState, OrderCaseState[]> = {
  Open: ['Resolving', 'Resolved'],
  Resolving: ['Open', 'Resolved'],
  Resolved: ['Resolving'],
}

export const isOrderCaseStateTransitionAllowed = (from: OrderCaseState, to: OrderCaseState) => {
  if (from === to) return false
  return ALLOWED_NEXT_STATES[from].includes(to)
}

export const isOrderCaseOpen = (orderCase: Pick<OrderCase, 'state'>) => orderCase.state === 'Open'
export const isOrderCaseResolving = (orderCase: Pick<OrderCase, 'state'>) => orderCase.state === 'Resolving'
export const isOrderCaseResolved = (orderCase: Pick<OrderCase, 'state'>) => orderCase.state === 'Resolved'
export const hasOrderCaseUnseenChats = (orderCase: Pick<OrderCase, 'unseen_chats'>) => orderCase.unseen_chats > 0
