import { useMemo } from 'react'
import { useOrderCaseMainContext } from '../providers'

export function useOrderCaseListPageController() {
  const main = useOrderCaseMainContext()

  return useMemo(() => ({
    activeCases: main.listController.activeCases,
    resolvedCases: main.listController.resolvedCases,
    error: main.listController.error,
    hasLoaded: main.listController.hasLoaded,
    isLoading: main.listController.isLoading,
    onClose: main.closeOverlay,
    onOpenCase: main.openCase,
  }), [main])
}
