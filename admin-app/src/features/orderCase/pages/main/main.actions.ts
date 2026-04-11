import { useCallback, useRef } from 'react'

import { useSectionManager } from '@/shared/resource-manager/useResourceManager'

import { isOrderCaseStringFilter } from '../../domain/orderCaseFilter.config'
import type { OrderCaseQueryFilters } from '../../types'
import {
  deleteOrderCaseQueryFilter,
  resetOrderCaseQuery,
  setOrderCaseQueryFilters,
  setOrderCaseQuerySearch,
  updateOrderCaseQueryFilters,
  useOrderCaseQuery,
} from '../../store/orderCaseQueryStore'
import { setVisibleOrderCases } from '../../store/orderCaseStore'

export const useCaseMainActions = ({ onClose }: { onClose?: () => void } = {}) => {
  const query = useOrderCaseQuery()
  const sectionManager = useSectionManager()
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openCaseDetails = useCallback(
    (
      payload:
        | string
        | { orderCaseClientId?: string | null; orderCaseId?: number | null; freshAfter?: string | null },
    ) => {
      sectionManager.open({
        key: 'orderCase.details',
        payload: typeof payload === 'string' ? { orderCaseClientId: payload } : payload,
      })
    },
    [sectionManager],
  )

  const closeCaseMain = useCallback(() => {
    if (onClose) {
      onClose()
      return
    }
    sectionManager.close()
  }, [onClose, sectionManager])

  const applySearch = useCallback((input: string) => {
    const trimmed = input.trim()

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current)
    }

    if (!trimmed) {
      setOrderCaseQuerySearch('')
      setVisibleOrderCases(null)
      return
    }

    searchDebounceRef.current = setTimeout(() => {
      setOrderCaseQuerySearch(trimmed)
    }, 300)
  }, [])

  const applyFilters = useCallback((filters: OrderCaseQueryFilters) => {
    setOrderCaseQueryFilters(filters)
  }, [])

  const updateFilters = useCallback(
    (key: string, value: unknown) => {
      if (isOrderCaseStringFilter(key)) {
        const previous = query.filters.s ?? []
        const alreadySelected = previous.includes(key)
        if (alreadySelected) return

        updateOrderCaseQueryFilters({
          s: [...previous, key],
        })
        return
      }

      updateOrderCaseQueryFilters({ [key]: value })
    },
    [query],
  )

  const deleteFilter = useCallback(
    (key: string) => {
      if (isOrderCaseStringFilter(key)) {
        const newStringFilters = (query.filters.s || []).filter((f) => f !== key)

        updateOrderCaseQueryFilters({ s: newStringFilters })
        return
      }

      deleteOrderCaseQueryFilter(key as keyof OrderCaseQueryFilters)
    },
    [query],
  )

  const resetQuery = useCallback(() => {
    resetOrderCaseQuery()
  }, [])

  return {
    openCaseDetails,
    closeCaseMain,
    applySearch,
    applyFilters,
    updateFilters,
    deleteFilter,
    resetQuery,
  }
}
