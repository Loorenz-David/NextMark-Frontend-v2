import type { OrderCase, OrderCaseState } from '../types'
import type { OrderCaseStats } from '../types/orderCaseMeta'
const ORDER_CASE_STATE_TO_ID: Record<OrderCaseState, number> = {
  Open: 1,
  Resolving: 2,
  Resolved: 3,
}

export const orderCasesCount = (cases: OrderCase[]): OrderCaseStats => {
  const caseCountMap: OrderCaseStats = {
    order_cases: {
      total: 0,
      by_state: {},
    },
    open_cases: {
      total: 0,
    },
    resolving_cases: {
      total: 0,
    },
  }

  cases.forEach((orderCase) => {
    caseCountMap.order_cases.total += 1
    const stateId = ORDER_CASE_STATE_TO_ID[orderCase.state]
    caseCountMap.order_cases.by_state[stateId] = (caseCountMap.order_cases.by_state[stateId] ?? 0) + 1

    if (orderCase.state === 'Open') {
      caseCountMap.open_cases.total += 1
    }

    if (orderCase.state === 'Resolving') {
      caseCountMap.resolving_cases.total += 1
    }
  })

  return caseCountMap
}
