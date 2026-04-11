import { useCallback } from 'react'

import { ApiError } from '@/lib/api/ApiClient'
import { useMessageHandler } from '@shared-message-handler'

import { useGetOrders } from '../api/orderApi'
import { useOrderModel } from '../domain/useOrderModel'

import { setOrderListError, setOrderListResult } from '../store/orderList.store'
import { useUpsertOrdersStore } from '../store/orderHooks.store'
import { setVisibleOrders } from '../store/order.store'
import type {  OrderQueryStoreFilters } from '../types/orderMeta'
import { normalizeQuery } from '@shared-utils'
import { orderStringFilters } from '../domain/orderFilterConfig'


export const buildOrderQueryKey = (query?:  OrderQueryStoreFilters) => JSON.stringify(query ?? {})

export const useOrderFlow = () => {
  const getOrders = useGetOrders()
  const { normalizeOrderPayload } = useOrderModel()
  const upsertOrdersStore = useUpsertOrdersStore()
  const { showMessage } = useMessageHandler()
  

  const loadOrdersPage = useCallback(
    async (query?: OrderQueryStoreFilters) => {
      const normalizedQuery = normalizeQuery(query ?? {}, orderStringFilters)
     
      try {
        const response = await getOrders(normalizedQuery)

        const payload = response.data
       
        if (!payload?.order) {
          setOrderListError('Missing orders response.')
          return null
        }

        const normalized = normalizeOrderPayload(payload.order)

        upsertOrdersStore(normalized)

        return {
          normalized,
          pagination: payload.order_pagination,
          stats: payload.order_stats,
        }
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Unable to load orders.'
        const status = error instanceof ApiError ? error.status : 500
        setOrderListError(message)
        showMessage({ status, message })
        return null
      }
    },
    [],
  )

  const loadOrders = useCallback(
    async (query?: OrderQueryStoreFilters, _firstLoad?: boolean) => {
      const response = await loadOrdersPage(query)
      if (!response) {
        return null
      }

      setVisibleOrders(response.normalized.allIds)
      setOrderListResult({
        queryKey: buildOrderQueryKey(query),
        query,
        stats: response.stats,
        pagination: response.pagination,
      })

      return response.normalized
    },
    [loadOrdersPage],
  )

  return {
    loadOrdersPage,
    loadOrders,
  }
}
