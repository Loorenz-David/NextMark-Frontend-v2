import { useCallback } from 'react'

import { ApiError } from '@/lib/api/ApiClient'
import { useMessageHandler } from '@shared-message-handler'

import { useGetOrderCase, useGetOrderCases } from '../api/orderCase.api'

import { useOrderCaseModel } from '../domain/orderCase.model'

import { setVisibleOrderCases, upsertOrderCase, upsertOrderCases } from '../store/orderCaseStore'
import type { OrderCaseQueryStoreFilters } from '../types'
import { orderCaseStringFilters } from '../domain/orderCaseFilter.config'
import { normalizeQuery } from '@shared-utils'
import { setOrderCaseListResult } from '../store/orderCaseList.store'

const buildQueryKey = (query?: OrderCaseQueryStoreFilters) => JSON.stringify(query ?? {})

export const useOrderCaseFlow = () => {
  const getOrderCases = useGetOrderCases()
  const getOrderCase = useGetOrderCase()
  const { normalizeOrderCaseEntity, normalizeOrderCaseMap } = useOrderCaseModel()
  const { showMessage } = useMessageHandler()

  const loadAllCases = useCallback(
    async (query?: OrderCaseQueryStoreFilters, firstLoad?: boolean) => {
      const requestedSearch = query?.q?.trim() ?? ''
      const queryKey = buildQueryKey(query)
      if (!requestedSearch && firstLoad === false) {
        setVisibleOrderCases(null)
        return null
      }

      try {
        const normalizedQuery = normalizeQuery(query ?? {}, orderCaseStringFilters)

        const response = await getOrderCases(normalizedQuery)
        const payload = response.data
        const normalized = normalizeOrderCaseMap(payload?.order_cases)
        upsertOrderCases(normalized)
        setOrderCaseListResult({
          queryKey,
          query,
          stats: payload.order_cases_stats,
          pagination: payload.order_cases_pagination
        })
        

        setVisibleOrderCases(normalized.allIds)
        return normalized
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Unable to load order cases.'
        const status = error instanceof ApiError ? error.status : 500
        showMessage({ status, message })
        return null
      }
    },
    [getOrderCases, normalizeOrderCaseMap, showMessage],
  )

  const loadCasesByOrder = useCallback(async (orderId: number) => {
    try {
      const response = await getOrderCases({ order_id: orderId })
      const normalized = normalizeOrderCaseMap(response.data?.order_cases)
      upsertOrderCases(normalized)
      setVisibleOrderCases(normalized.allIds)
      return normalized
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Unable to load order cases.'
      const status = error instanceof ApiError ? error.status : 500
      showMessage({ status, message })
      return null
    }
  }, [getOrderCases, normalizeOrderCaseMap, showMessage])

  const loadCaseDetails = useCallback(async (orderCaseId: number) => {
    try {
      const response = await getOrderCase(orderCaseId)
      const normalized = normalizeOrderCaseEntity(response.data?.order_case as never)
      if (!normalized) return null
      upsertOrderCase(normalized)
      return normalized
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Unable to load case details.'
      const status = error instanceof ApiError ? error.status : 500
      showMessage({ status, message })
      return null
    }
  }, [getOrderCase, normalizeOrderCaseEntity, showMessage])

  return {
    loadAllCases,
    loadCasesByOrder,
    loadCaseDetails,
  }
}
