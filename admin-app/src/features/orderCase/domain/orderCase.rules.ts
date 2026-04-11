import type { OrderCase, OrderCaseState } from '../types'

const ALLOWED_NEXT_STATES: Record<OrderCaseState, OrderCaseState[]> = {
  Open: ['Resolving', 'Resolved'],
  Resolving: ['Open', 'Resolved'],
  Resolved: ['Resolving'],
}

export const useOrderCaseRules = () => {
  const isStateTransitionAllowed = (from: OrderCaseState, to: OrderCaseState) => {
    if (from === to) return false
    return ALLOWED_NEXT_STATES[from].includes(to)
  }

  const isOpen = (orderCase: Pick<OrderCase, 'state'>) => orderCase.state === 'Open'
  const isResolving = (orderCase: Pick<OrderCase, 'state'>) => orderCase.state === 'Resolving'
  const isResolved = (orderCase: Pick<OrderCase, 'state'>) => orderCase.state === 'Resolved'
  const hasUnseenChats = (orderCase: Pick<OrderCase, 'unseen_chats'>) => orderCase.unseen_chats > 0

  return {
    isStateTransitionAllowed,
    isOpen,
    isResolving,
    isResolved,
    hasUnseenChats,
  }
}
