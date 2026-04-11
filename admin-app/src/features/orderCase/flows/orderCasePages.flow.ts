import { useEffect, useRef, useState } from 'react'
import { shouldRefreshForFreshness } from '@shared-utils'

import { useOrderCaseByClientId,   useOrderCasesByOrderId, useVisibleOrderCases } from '../store/orderCaseStore'
import { useOrderCaseFlow } from './orderCase.flow'
import { useDetailsControllers } from '../controllers/details.controllers'

import { useOrderCaseQuery } from '../store/orderCaseQueryStore'
import { useOrderCaseListStats } from '../store/orderCaseList.selectors'
import { orderCasesCount } from '../domain/orderCases.count'

export const useOrderCaseMainFlow = ( ) => {
  const { loadAllCases } = useOrderCaseFlow()
  const firstPageLoad = useRef(true)
  const cases = useVisibleOrderCases()
  const casesStats = useOrderCaseListStats()

  const query = useOrderCaseQuery()

   useEffect(()=>{
        if(!firstPageLoad.current){
            loadAllCases(query, firstPageLoad.current)
            firstPageLoad.current = false
            return
        }
        loadAllCases(query)
  },[query])


  return {
    cases,
    casesStats,
    query
  }
}

export const useOrderCasesByOrderFlow = (orderId: number | null) => {
  const { loadCasesByOrder } = useOrderCaseFlow()
  const cases = useOrderCasesByOrderId(orderId)
  const casesStats = orderCasesCount(cases)
  
  const refreshCases = loadCasesByOrder

  useEffect(() => {
    if (orderId == null) return

    void loadCasesByOrder(orderId)
  }, [ orderId])

  return {
    cases,
    casesStats,
    refreshCases,
  }
}

export const useOrderCaseDetailsFlow = (
  orderCaseClientId: string | null,
  orderCaseIdFromPayload: number | null,
  freshAfter?: string | null,
) => {
  const { loadCaseDetails } = useOrderCaseFlow()
  const { markCaseChatsAsRead } = useDetailsControllers()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const lastRefreshAttemptRef = useRef<string | null>(null)

  const orderCase = useOrderCaseByClientId(orderCaseClientId)
  const orderCaseId = orderCase?.id ?? orderCaseIdFromPayload
  const shouldRefresh = orderCase == null || shouldRefreshForFreshness(orderCase.updated_at ?? null, freshAfter)

  useEffect(() => {
    if (!orderCaseId) {
      lastRefreshAttemptRef.current = null
      return
    }
    if (!shouldRefresh) {
      lastRefreshAttemptRef.current = null
      return
    }

    const refreshKey = `${orderCaseId}:${freshAfter ?? ''}`
    if (lastRefreshAttemptRef.current === refreshKey) {
      return
    }
    lastRefreshAttemptRef.current = refreshKey

    let cancelled = false

    const refreshCase = async () => {
      setIsRefreshing(true)
      try {
        await loadCaseDetails(orderCaseId)
      } finally {
        if (!cancelled) {
          setIsRefreshing(false)
        }
      }
    }

    void refreshCase()

    return () => {
      cancelled = true
    }
  }, [freshAfter, loadCaseDetails, orderCaseId, shouldRefresh])

  useEffect(() => {
    if (!orderCase || !orderCaseId || orderCase.unseen_chats <= 0) return
    void markCaseChatsAsRead(orderCaseId)
  }, [orderCase])

  return {
    orderCase,
    isRefreshing,
  }
}
