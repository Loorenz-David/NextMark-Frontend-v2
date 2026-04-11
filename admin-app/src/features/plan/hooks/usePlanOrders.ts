import { useCallback } from 'react'
import { useMessageHandler } from '@shared-message-handler'
import { ApiError } from '@/lib/api/ApiClient'
import { upsertOrders } from '@/features/order/store/order.store'
import {
  setOrderListError,
} from '@/features/order/store/orderList.store'
import { planApi } from '@/features/plan/api/plan.api'

export function usePlanOrders() {
  const { showMessage } = useMessageHandler()

  const fetchPlanOrders = useCallback(async (planId: number | string) => {
    try {
      const response = await planApi.getPlanOrders(planId)
      const payload = response.data
      if (!payload?.order) {
        setOrderListError('Missing orders response.')
        return null
      }
      upsertOrders(payload.order)

      return payload

    } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Unable to load orders.'
        const status = error instanceof ApiError ? error.status : 500
        console.error('Failed to fetch orders', error)
        setOrderListError(message)
        showMessage({ status, message })
      return null
    }
  }, [showMessage])

  

  return { fetchPlanOrders }
}
