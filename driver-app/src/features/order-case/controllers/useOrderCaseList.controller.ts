import { useEffect, useMemo } from 'react'
import { selectOrderCaseListScope, selectOrderCasesByOrderId, useOrderCaseListStore, useOrderCasesStore } from '../stores'
import { initializeOrderCasesForOrderFlow, openOrderCaseChatFlow } from '../flows'

type UseOrderCaseListControllerOptions = {
  orderId: number
  openCase: (orderCaseId: number, orderCaseClientId: string) => void
}

export function useOrderCaseListController({
  orderId,
  openCase,
}: UseOrderCaseListControllerOptions) {
  const listState = useOrderCaseListStore((state) => state)
  const casesState = useOrderCasesStore((state) => state)

  useEffect(() => {
    void initializeOrderCasesForOrderFlow(orderId)
  }, [orderId])

  const scope = useMemo(() => selectOrderCaseListScope(listState, orderId), [listState, orderId])
  const allCases = useMemo(() => selectOrderCasesByOrderId(casesState, orderId), [casesState, orderId])
  const activeCases = useMemo(() => allCases.filter((orderCase) => orderCase.state !== 'Resolved'), [allCases])
  const resolvedCases = useMemo(() => allCases.filter((orderCase) => orderCase.state === 'Resolved'), [allCases])

  const handleOpenCase = (orderCaseId: number, orderCaseClientId: string) => {
    void openOrderCaseChatFlow({
      orderCaseId,
      orderCaseClientId,
      orderId,
      openCase,
    })
  }

  return {
    activeCases,
    resolvedCases,
    isLoading: scope?.isLoading ?? false,
    error: scope?.error ?? null,
    hasLoaded: Boolean(scope),
    openCase: handleOpenCase,
  }
}
